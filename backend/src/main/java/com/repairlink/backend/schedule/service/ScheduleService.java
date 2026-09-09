package com.repairlink.backend.schedule.service;

import com.repairlink.backend.common.exception.ScheduleNotFoundException;
import com.repairlink.backend.common.exception.ScheduleOverlapException;
import com.repairlink.backend.schedule.dto.*;
import com.repairlink.backend.schedule.entity.ScheduleBlockedDate;
import com.repairlink.backend.schedule.entity.ScheduleBreak;
import com.repairlink.backend.schedule.entity.ScheduleConfiguration;
import com.repairlink.backend.schedule.entity.ScheduleStatus;
import com.repairlink.backend.schedule.entity.SlotHold;
import com.repairlink.backend.schedule.repository.ScheduleBlockedDateRepository;
import com.repairlink.backend.schedule.repository.ScheduleBreakRepository;
import com.repairlink.backend.schedule.repository.ScheduleConfigurationRepository;
import com.repairlink.backend.schedule.repository.SlotHoldRepository;
import com.repairlink.backend.security.auth.entity.UserAccount;
import com.repairlink.backend.security.auth.repository.UserAccountRepository;
import com.repairlink.backend.schedule.entity.SlotHoldStatus;
import com.repairlink.backend.serviceRequest.repository.ServiceRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleConfigurationRepository configurationRepository;
    private final ScheduleBreakRepository breakRepository;
    private final ScheduleBlockedDateRepository blockedDateRepository;
    private final SlotHoldRepository slotHoldRepository;
    private final UserAccountRepository userRepository;
    private final ServiceRequestRepository serviceRequestRepository;

    public ScheduleService(
            ScheduleConfigurationRepository configurationRepository,
            ScheduleBreakRepository breakRepository,
            ScheduleBlockedDateRepository blockedDateRepository,
            SlotHoldRepository slotHoldRepository,
            UserAccountRepository userRepository,
            ServiceRequestRepository serviceRequestRepository
    ) {
        this.configurationRepository = configurationRepository;
        this.breakRepository = breakRepository;
        this.blockedDateRepository = blockedDateRepository;
        this.slotHoldRepository = slotHoldRepository;
        this.userRepository = userRepository;
        this.serviceRequestRepository = serviceRequestRepository;
    }

    @Transactional(readOnly = true)
    public SchedulePageResponse listConfigurations(LocalDate dateFrom, LocalDate dateTo, int page, int size) {
        Page<ScheduleConfiguration> configPage = configurationRepository.findByDateRange(
                dateFrom,
                dateTo,
                PageRequest.of(Math.max(0, page), Math.max(1, size))
        );

        long totalConfigs = configurationRepository.count();
        String currentWindow = configurationRepository.findFirstByStatus(ScheduleStatus.CURRENT)
                .map(ScheduleConfiguration::getName)
                .orElse("None");

        LocalDate nextOpening = configurationRepository.findFirstByStatusOrderByStartDateAsc(ScheduleStatus.UPCOMING)
                .map(ScheduleConfiguration::getStartDate)
                .orElse(null);

        ScheduleMetricsResponse metrics = new ScheduleMetricsResponse(totalConfigs, currentWindow, nextOpening);

        List<ScheduleConfigurationResponse> content = configPage.getContent().stream()
                .map(config -> new ScheduleConfigurationResponse(
                        config.getConfigurationId(),
                        config.getName(),
                        config.getStartDate(),
                        config.getEndDate(),
                        config.getStatus(),
                        config.getOperatingDays() != null ? config.getOperatingDays().size() : 0,
                        config.getSlotDurationMinutes(),
                        config.getSlotCapacity()
                ))
                .toList();

        return new SchedulePageResponse(
                metrics,
                content,
                configPage.getNumber(),
                configPage.getSize(),
                configPage.getTotalElements(),
                configPage.getTotalPages(),
                configPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public ScheduleConfigurationDetailResponse getConfiguration(UUID configurationId) {
        ScheduleConfiguration config = configurationRepository.findById(configurationId)
                .orElseThrow(() -> new ScheduleNotFoundException("Schedule configuration not found with ID: " + configurationId));

        boolean canEditBlockedDates = config.getStatus() == ScheduleStatus.CURRENT || config.getStatus() == ScheduleStatus.UPCOMING;

        List<ScheduleBreakDto> breakDtos = config.getBreaks().stream()
                .map(b -> new ScheduleBreakDto(b.getBreakId(), b.getDayOfWeek(), b.getStartTime(), b.getEndTime(), b.getLabel()))
                .toList();

        List<ScheduleBlockedDateResponse> blockedDtos = config.getBlockedDates().stream()
                .map(d -> new ScheduleBlockedDateResponse(d.getBlockedDateId(), config.getConfigurationId(), d.getBlockedDate(), d.getReason()))
                .toList();

        return new ScheduleConfigurationDetailResponse(
                config.getConfigurationId(),
                config.getName(),
                config.getStartDate(),
                config.getEndDate(),
                config.getBookingWindowDays(),
                config.getOpeningTime(),
                config.getClosingTime(),
                config.getSlotDurationMinutes(),
                config.getSlotCapacity(),
                config.getHoldDurationMinutes(),
                config.getCancellationNoticeHours(),
                config.getOperatingDays(),
                config.getStatus(),
                canEditBlockedDates,
                breakDtos,
                blockedDtos
        );
    }

    @Transactional
    public ScheduleConfigurationDetailResponse createConfiguration(UUID adminUserId, CreateScheduleConfigurationRequest request) {
        if (!request.closingTime().isAfter(request.openingTime())) {
            throw new IllegalArgumentException("Closing time must be later than opening time.");
        }
        if (request.slotDurationMinutes() < 15) {
            throw new IllegalArgumentException("Slot duration must be at least 15 minutes.");
        }
        if (request.operatingDays() == null || request.operatingDays().isEmpty()) {
            throw new IllegalArgumentException("At least one operating day must be selected.");
        }

        List<String> normalizedOperatingDays = request.operatingDays().stream()
                .map(String::toUpperCase)
                .toList();

        Set<LocalDate> requestedBlockedDates = new HashSet<>();
        if (request.blockedDates() != null) {
            for (ScheduleBlockedDateRequest b : request.blockedDates()) {
                requestedBlockedDates.add(b.blockedDate());
            }
        }

        LocalDate calculatedEnd = calculateEndDate(
                request.startDate(),
                request.bookingWindowDays(),
                normalizedOperatingDays,
                requestedBlockedDates
        );

        List<ScheduleConfiguration> overlapping = configurationRepository.findOverlappingConfigurations(
                request.startDate(),
                calculatedEnd,
                null
        );

        if (!overlapping.isEmpty()) {
            ScheduleConfiguration conflict = overlapping.get(0);
            throw new ScheduleOverlapException(
                    "This date overlaps " + conflict.getName() + " (" + conflict.getStartDate() + " to " + conflict.getEndDate() + "). Choose a later date."
            );
        }

        UserAccount adminUser = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;

        String configName = (request.name() != null && !request.name().isBlank())
                ? request.name().trim()
                : "Config " + (configurationRepository.count() + 1);

        LocalDate today = LocalDate.now();
        ScheduleStatus status;
        if (calculatedEnd.isBefore(today)) {
            status = ScheduleStatus.COMPLETED;
        } else if (!request.startDate().isAfter(today) && !calculatedEnd.isBefore(today)) {
            status = ScheduleStatus.CURRENT;
        } else {
            status = ScheduleStatus.UPCOMING;
        }

        ScheduleConfiguration config = new ScheduleConfiguration();
        config.setName(configName);
        config.setStartDate(request.startDate());
        config.setEndDate(calculatedEnd);
        config.setBookingWindowDays(request.bookingWindowDays());
        config.setOpeningTime(request.openingTime());
        config.setClosingTime(request.closingTime());
        config.setSlotDurationMinutes(request.slotDurationMinutes());
        config.setSlotCapacity(request.slotCapacity());
        config.setHoldDurationMinutes(request.holdDurationMinutes());
        config.setCancellationNoticeHours(request.cancellationNoticeHours());
        config.setOperatingDays(normalizedOperatingDays);
        config.setStatus(status);
        config.setCreatedBy(adminUser);
        config.setUpdatedBy(adminUser);

        if (request.breaks() != null) {
            Map<String, List<ScheduleBreakDto>> breaksByDay = new HashMap<>();
            for (ScheduleBreakDto breakDto : request.breaks()) {
                if (!breakDto.endTime().isAfter(breakDto.startTime())) {
                    throw new IllegalArgumentException("Break end time must be after start time: " + breakDto.startTime() + " - " + breakDto.endTime());
                }
                if (breakDto.startTime().isBefore(request.openingTime()) || breakDto.endTime().isAfter(request.closingTime())) {
                    throw new IllegalArgumentException("Break time (" + breakDto.startTime() + " - " + breakDto.endTime() + ") must be within operating hours (" + request.openingTime() + " - " + request.closingTime() + ").");
                }
                String day = breakDto.dayOfWeek().toUpperCase();
                List<ScheduleBreakDto> dayList = breaksByDay.computeIfAbsent(day, k -> new ArrayList<>());
                for (ScheduleBreakDto existing : dayList) {
                    if (breakDto.startTime().isBefore(existing.endTime()) && breakDto.endTime().isAfter(existing.startTime())) {
                        throw new IllegalArgumentException("Break times on " + day + " overlap: (" + breakDto.startTime() + " - " + breakDto.endTime() + ") conflicts with (" + existing.startTime() + " - " + existing.endTime() + ").");
                    }
                }
                dayList.add(breakDto);
                ScheduleBreak sb = new ScheduleBreak(
                        config,
                        day,
                        breakDto.startTime(),
                        breakDto.endTime(),
                        breakDto.label()
                );
                config.addBreak(sb);
            }
        }

        if (request.blockedDates() != null) {
            Set<LocalDate> seenDates = new HashSet<>();
            for (ScheduleBlockedDateRequest bd : request.blockedDates()) {
                if (!seenDates.add(bd.blockedDate())) {
                    throw new IllegalArgumentException("Duplicate blocked date: " + bd.blockedDate());
                }
                if (bd.blockedDate().isBefore(request.startDate()) || bd.blockedDate().isAfter(calculatedEnd)) {
                    throw new IllegalArgumentException("Blocked date " + bd.blockedDate() + " must fall within the configuration window (" + request.startDate() + " to " + calculatedEnd + ").");
                }
                ScheduleBlockedDate sbd = new ScheduleBlockedDate(config, bd.blockedDate(), bd.reason().trim(), adminUser);
                config.addBlockedDate(sbd);
            }
        }

        ScheduleConfiguration saved = configurationRepository.save(config);
        return getConfiguration(saved.getConfigurationId());
    }

    @Transactional
    public void deleteConfiguration(UUID configurationId) {
        ScheduleConfiguration config = configurationRepository.findById(configurationId)
                .orElseThrow(() -> new ScheduleNotFoundException("Configuration not found with ID: " + configurationId));

        if (config.getStatus() != ScheduleStatus.UPCOMING) {
            throw new IllegalArgumentException("Only upcoming schedule configurations can be deleted. Current and completed configurations cannot be deleted.");
        }

        configurationRepository.delete(config);
    }

    @Transactional
    public ScheduleBlockedDateResponse addBlockedDate(UUID adminUserId, UUID configurationId, ScheduleBlockedDateRequest request) {
        ScheduleConfiguration config = configurationRepository.findById(configurationId)
                .orElseThrow(() -> new ScheduleNotFoundException("Configuration not found with ID: " + configurationId));

        if (config.getStatus() == ScheduleStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot add blocked dates to completed configurations.");
        }

        LocalDate targetDate = request.blockedDate();
        if (targetDate.isBefore(config.getStartDate()) || targetDate.isAfter(config.getEndDate())) {
            throw new IllegalArgumentException("Blocked date must be within configuration date range (" + config.getStartDate() + " to " + config.getEndDate() + ").");
        }

        if (!targetDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Only future dates can be blocked.");
        }

        boolean alreadyBlocked = config.getBlockedDates().stream()
                .anyMatch(b -> b.getBlockedDate().equals(targetDate));
        if (alreadyBlocked) {
            throw new IllegalArgumentException("Date " + targetDate + " is already blocked in this configuration.");
        }

        UserAccount adminUser = adminUserId != null ? userRepository.findById(adminUserId).orElse(null) : null;
        ScheduleBlockedDate newBlock = new ScheduleBlockedDate(config, targetDate, request.reason().trim(), adminUser);
        config.addBlockedDate(newBlock);
        ScheduleBlockedDate saved = blockedDateRepository.save(newBlock);

        return new ScheduleBlockedDateResponse(saved.getBlockedDateId(), config.getConfigurationId(), saved.getBlockedDate(), saved.getReason());
    }

    @Transactional
    public void removeBlockedDate(UUID configurationId, UUID blockedDateId) {
        ScheduleBlockedDate blockedDate = blockedDateRepository.findById(blockedDateId)
                .orElseThrow(() -> new IllegalArgumentException("Blocked date not found with ID: " + blockedDateId));

        if (!blockedDate.getConfiguration().getConfigurationId().equals(configurationId)) {
            throw new IllegalArgumentException("Blocked date does not belong to the specified configuration.");
        }

        if (!blockedDate.getBlockedDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Past blocked dates cannot be removed.");
        }

        blockedDateRepository.delete(blockedDate);
    }

    public SimulateScheduleResponse simulateSchedule(SimulateScheduleRequest request) {
        List<String> normalizedDays = request.operatingDays().stream().map(String::toUpperCase).toList();

        Set<LocalDate> blockedSet = new HashSet<>();
        if (request.blockedDates() != null) {
            for (ScheduleBlockedDateRequest b : request.blockedDates()) {
                blockedSet.add(b.blockedDate());
            }
        }

        LocalDate calculatedEnd = calculateEndDate(
                request.startDate(),
                request.bookingWindowDays(),
                normalizedDays,
                blockedSet
        );

        Map<String, List<SlotDto>> slotsByDay = new LinkedHashMap<>();

        Map<String, List<ScheduleBreakDto>> breaksByDay = new HashMap<>();
        if (request.breaks() != null) {
            for (ScheduleBreakDto b : request.breaks()) {
                breaksByDay.computeIfAbsent(b.dayOfWeek().toUpperCase(), k -> new ArrayList<>()).add(b);
            }
        }

        for (String day : normalizedDays) {
            List<ScheduleBreakDto> dayBreaks = breaksByDay.getOrDefault(day, Collections.emptyList());
            slotsByDay.put(day, generateSlots(request.openingTime(), request.closingTime(), request.slotDurationMinutes(), dayBreaks));
        }

        return new SimulateScheduleResponse(calculatedEnd, slotsByDay);
    }

    @Transactional(readOnly = true)
    public DailySlotsResponse getDailySlots(LocalDate date) {
        return getDailySlots(date, null);
    }

    @Transactional(readOnly = true)
    public DailySlotsResponse getDailySlots(LocalDate date, UUID customerId) {
        LocalDate today = LocalDate.now();
        if (date.isBefore(today)) {
            return new DailySlotsResponse(date, date.getDayOfWeek().name(), false, false, "Cannot book appointments for past dates.", null, Collections.emptyList());
        }

        List<ScheduleConfiguration> configs = configurationRepository.findConfigurationsForDate(date);
        if (configs.isEmpty()) {
            return new DailySlotsResponse(date, date.getDayOfWeek().name(), false, false, "No active schedule configuration for this date.", null, Collections.emptyList());
        }

        ScheduleConfiguration config = configs.get(0);
        String dayOfWeek = date.getDayOfWeek().name();

        LocalDate earliestDate = calculateEarliestSelectableDate(config, today, ADVANCE_NOTICE_AVAILABLE_DAYS);
        if (date.isBefore(earliestDate)) {
            return new DailySlotsResponse(
                    date,
                    dayOfWeek,
                    false,
                    false,
                    "Appointments must be booked at least " + ADVANCE_NOTICE_AVAILABLE_DAYS + " available working days in advance. Earliest available date is " + earliestDate + ".",
                    config.getSlotDurationMinutes(),
                    Collections.emptyList()
            );
        }

        if (config.getOperatingDays() == null || !config.getOperatingDays().contains(dayOfWeek)) {
            return new DailySlotsResponse(date, dayOfWeek, false, false, "Workshop is closed on " + dayOfWeek + "s.", config.getSlotDurationMinutes(), Collections.emptyList());
        }

        Optional<ScheduleBlockedDate> blocked = config.getBlockedDates().stream()
                .filter(b -> b.getBlockedDate().equals(date))
                .findFirst();

        if (blocked.isPresent()) {
            return new DailySlotsResponse(date, dayOfWeek, false, true, blocked.get().getReason(), config.getSlotDurationMinutes(), Collections.emptyList());
        }

        List<ScheduleBreakDto> dayBreaks = config.getBreaks().stream()
                .filter(b -> b.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                .map(b -> new ScheduleBreakDto(b.getBreakId(), b.getDayOfWeek(), b.getStartTime(), b.getEndTime(), b.getLabel()))
                .toList();

        List<SlotDto> slots = generateSlots(config.getOpeningTime(), config.getClosingTime(), config.getSlotDurationMinutes(), dayBreaks);

        // If selecting today, only show slots that are strictly after the current time
        if (date.equals(today)) {
            LocalTime currentTime = LocalTime.now();
            slots = slots.stream()
                    .filter(slot -> slot.startTime().isAfter(currentTime))
                    .toList();
        }

        int slotCapacity = (config.getSlotCapacity() != null && config.getSlotCapacity() > 0) ? config.getSlotCapacity() : 1;

        Map<String, Long> bookingCounts = new HashMap<>();
        for (Object[] row : serviceRequestRepository.countActiveBookingsByDateGroupByTimeSlot(date)) {
            String slot = (String) row[0];
            Long count = (Long) row[1];
            bookingCounts.put(slot, count);
        }

        Instant now = Instant.now();
        List<SlotHold> activeHolds = slotHoldRepository.findActiveHoldsByDate(date, now);
        Map<String, List<SlotHold>> holdsBySlot = new HashMap<>();
        for (SlotHold hold : activeHolds) {
            holdsBySlot.computeIfAbsent(hold.getTimeSlot(), k -> new ArrayList<>()).add(hold);
        }

        List<SlotDto> annotatedSlots = slots.stream().map(slot -> {
            if (slot.isBreak()) {
                return slot;
            }
            long bookedCount = bookingCounts.getOrDefault(slot.label(), 0L);
            List<SlotHold> slotHolds = holdsBySlot.getOrDefault(slot.label(), Collections.emptyList());
            boolean isHeldByCurrentUser = customerId != null && slotHolds.stream()
                    .anyMatch(h -> h.getCustomer().getUserId().equals(customerId));
            long otherHoldsCount = slotHolds.stream()
                    .filter(h -> customerId == null || !h.getCustomer().getUserId().equals(customerId))
                    .count();

            int availableCapacity = (int) Math.max(0, slotCapacity - bookedCount - otherHoldsCount);
            boolean isSelectable = isHeldByCurrentUser || availableCapacity > 0;
            boolean isHeld = !slotHolds.isEmpty();

            String holdStatusMessage = null;
            if (isHeldByCurrentUser) {
                holdStatusMessage = "Held by you";
            } else if (bookedCount >= slotCapacity) {
                holdStatusMessage = "Fully booked";
            } else if (availableCapacity == 0) {
                holdStatusMessage = "Currently reserved by other customers";
            } else if (availableCapacity == 1) {
                holdStatusMessage = "1 spot left";
            } else {
                holdStatusMessage = availableCapacity + " spots available";
            }

            return new SlotDto(
                    slot.startTime(),
                    slot.endTime(),
                    slot.label(),
                    false,
                    isSelectable,
                    isHeld,
                    isHeldByCurrentUser,
                    holdStatusMessage,
                    slotCapacity,
                    availableCapacity
            );
        }).toList();

        return new DailySlotsResponse(date, dayOfWeek, true, false, null, config.getSlotDurationMinutes(), annotatedSlots);
    }

    private LocalDate calculateEndDate(LocalDate startDate, int bookingWindowDays, List<String> operatingDays, Set<LocalDate> blockedDates) {
        LocalDate current = startDate.plusDays(bookingWindowDays - 1L);
        while (true) {
            String day = current.getDayOfWeek().name();
            boolean isOperating = operatingDays.contains(day);
            boolean isBlocked = blockedDates.contains(current);

            if (isOperating && !isBlocked) {
                break;
            }
            current = current.plusDays(1);
        }
        return current;
    }

    private List<SlotDto> generateSlots(LocalTime opening, LocalTime closing, int durationMinutes, List<ScheduleBreakDto> breaks) {
        List<SlotDto> slots = new ArrayList<>();
        List<ScheduleBreakDto> sortedBreaks = breaks.stream()
                .sorted(Comparator.comparing(ScheduleBreakDto::startTime))
                .toList();

        LocalTime current = opening;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        while (current.isBefore(closing)) {
            final LocalTime start = current;
            Optional<ScheduleBreakDto> activeBreak = sortedBreaks.stream()
                    .filter(b -> !start.isBefore(b.startTime()) && start.isBefore(b.endTime()))
                    .findFirst();

            if (activeBreak.isPresent()) {
                ScheduleBreakDto b = activeBreak.get();
                slots.add(new SlotDto(b.startTime(), b.endTime(), b.startTime().format(formatter) + " – " + b.endTime().format(formatter), true, false));
                current = b.endTime();
                continue;
            }

            Optional<ScheduleBreakDto> nextBreak = sortedBreaks.stream()
                    .filter(b -> b.startTime().isAfter(start) && b.startTime().isBefore(start.plusMinutes(durationMinutes)))
                    .findFirst();

            if (nextBreak.isPresent()) {
                LocalTime nextBreakStart = nextBreak.get().startTime();
                slots.add(new SlotDto(start, nextBreakStart, start.format(formatter) + " – " + nextBreakStart.format(formatter), false, true));
                current = nextBreakStart;
                continue;
            }

            LocalTime nextEnd = start.plusMinutes(durationMinutes);
            if (nextEnd.isAfter(closing)) {
                nextEnd = closing;
            }

            slots.add(new SlotDto(start, nextEnd, start.format(formatter) + " – " + nextEnd.format(formatter), false, true));
            current = nextEnd;
        }

        return slots;
    }

    public static final int ADVANCE_NOTICE_AVAILABLE_DAYS = 2;

    public LocalDate calculateEarliestSelectableDate(ScheduleConfiguration config, LocalDate fromDate, int requiredAvailableDays) {
        if (config == null || config.getOperatingDays() == null || config.getOperatingDays().isEmpty()) {
            return fromDate.plusDays(requiredAvailableDays);
        }

        Set<String> operatingDays = new HashSet<>();
        for (String day : config.getOperatingDays()) {
            if (day != null) {
                operatingDays.add(day.trim().toUpperCase());
            }
        }

        Set<LocalDate> blockedDates = (config.getBlockedDates() != null)
                ? config.getBlockedDates().stream()
                        .map(ScheduleBlockedDate::getBlockedDate)
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        LocalDate current = fromDate.plusDays(1);
        int counted = 0;
        int maxLookaheadDays = 365;

        while (counted < requiredAvailableDays && maxLookaheadDays-- > 0) {
            String dayName = current.getDayOfWeek().name();
            boolean isOperating = operatingDays.contains(dayName);
            boolean isBlocked = blockedDates.contains(current);

            if (isOperating && !isBlocked) {
                counted++;
                if (counted == requiredAvailableDays) {
                    return current;
                }
            }
            current = current.plusDays(1);
        }

        return current;
    }

    public void validateBookingDate(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("Preferred date is required.");
        }
        LocalDate today = LocalDate.now();
        if (date.isBefore(today)) {
            throw new IllegalArgumentException("Cannot book appointments for past dates.");
        }

        ScheduleConfiguration config = configurationRepository.findConfigurationsForDate(date).stream()
                .findFirst()
                .orElseGet(() -> configurationRepository.findFirstByStatus(ScheduleStatus.CURRENT).orElse(null));

        if (config == null) {
            throw new IllegalArgumentException("No active schedule configuration for this date.");
        }

        LocalDate earliestDate = calculateEarliestSelectableDate(config, today, ADVANCE_NOTICE_AVAILABLE_DAYS);
        if (date.isBefore(earliestDate)) {
            throw new IllegalArgumentException(
                    "Appointments must be booked at least " + ADVANCE_NOTICE_AVAILABLE_DAYS +
                    " available working days in advance. Earliest available date is " + earliestDate + "."
            );
        }

        String dayOfWeek = date.getDayOfWeek().name();
        if (config.getOperatingDays() == null || !config.getOperatingDays().contains(dayOfWeek)) {
            throw new IllegalArgumentException("Workshop is closed on " + dayOfWeek + "s.");
        }

        boolean isBlocked = config.getBlockedDates() != null && config.getBlockedDates().stream()
                .anyMatch(b -> b.getBlockedDate().equals(date));
        if (isBlocked) {
            throw new IllegalArgumentException("Selected date is blocked for service.");
        }
    }

    @Transactional(readOnly = true)
    public ScheduleWindowResponse getCurrentWindow() {
        return configurationRepository.findFirstByStatus(ScheduleStatus.CURRENT)
                .map(config -> {
                    LocalDate today = LocalDate.now();
                    LocalDate earliestDate = calculateEarliestSelectableDate(config, today, ADVANCE_NOTICE_AVAILABLE_DAYS);
                    LocalDate effectiveStartDate = config.getStartDate();
                    if (effectiveStartDate == null || effectiveStartDate.isBefore(earliestDate)) {
                        effectiveStartDate = earliestDate;
                    }
                    return new ScheduleWindowResponse(
                            config.getName(),
                            effectiveStartDate,
                            config.getEndDate(),
                            config.getOperatingDays(),
                            config.getOpeningTime(),
                            config.getClosingTime(),
                            config.getSlotDurationMinutes()
                    );
                })
                .orElse(ScheduleWindowResponse.empty());
    }

    @Transactional(readOnly = true)
    public ScheduleWindowResponse getStaffScheduleWindow() {
        return configurationRepository.findFirstByStatus(ScheduleStatus.CURRENT)
                .map(config -> new ScheduleWindowResponse(
                        config.getName(),
                        config.getStartDate(),
                        config.getEndDate(),
                        config.getOperatingDays(),
                        config.getOpeningTime(),
                        config.getClosingTime(),
                        config.getSlotDurationMinutes()
                ))
                .orElse(ScheduleWindowResponse.empty());
    }

    private static final long HOLD_DURATION_SECONDS = 50L;

    @Transactional
    public HoldSlotResponse holdSlot(UUID customerId, LocalDate date, String timeSlot) {
        validateBookingDate(date);

        LocalDate today = LocalDate.now();
        if (date.equals(today)) {
            LocalTime slotStart = parseSlotStartTime(timeSlot);
            if (slotStart != null && !slotStart.isAfter(LocalTime.now())) {
                throw new IllegalArgumentException("Cannot hold a time slot that is in the past.");
            }
        }

        Instant now = Instant.now();
        Optional<SlotHold> existingActiveHold = slotHoldRepository.findActiveCustomerHold(customerId, date, timeSlot, now);
        if (existingActiveHold.isPresent()) {
            SlotHold hold = existingActiveHold.get();
            hold.setExpiresAt(now.plusSeconds(HOLD_DURATION_SECONDS));
            SlotHold saved = slotHoldRepository.save(hold);
            long secondsLeft = java.time.Duration.between(now, saved.getExpiresAt()).getSeconds();
            return new HoldSlotResponse(date, timeSlot, saved.getExpiresAt(), Math.max(0, secondsLeft), "Slot hold refreshed.");
        }

        ScheduleConfiguration config = configurationRepository.findConfigurationsForDate(date).stream()
                .findFirst()
                .orElseGet(() -> configurationRepository.findFirstByStatus(ScheduleStatus.CURRENT).orElse(null));
        int slotCapacity = (config != null && config.getSlotCapacity() != null && config.getSlotCapacity() > 0) ? config.getSlotCapacity() : 1;

        long bookedCount = serviceRequestRepository.countActiveBookingsByDateAndTimeSlot(date, timeSlot);
        List<SlotHold> activeHolds = slotHoldRepository.findActiveHoldsByDateAndTimeSlot(date, timeSlot, now);
        long otherHoldsCount = activeHolds.stream()
                .filter(h -> !h.getCustomer().getUserId().equals(customerId))
                .count();

        if (bookedCount + otherHoldsCount >= slotCapacity) {
            throw new IllegalStateException("This time slot is fully reserved by other customers. Please choose another slot.");
        }

        // Soft release any existing active hold for this customer (customer can hold only 1 slot at a time)
        slotHoldRepository.releaseActiveHoldsByCustomerId(customerId, now);

        UserAccount customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found."));

        Instant expiresAt = now.plusSeconds(HOLD_DURATION_SECONDS);
        SlotHold newHold = new SlotHold(customer, date, timeSlot, expiresAt);
        newHold.setStatus(SlotHoldStatus.ACTIVE);
        SlotHold saved = slotHoldRepository.save(newHold);

        return new HoldSlotResponse(date, timeSlot, saved.getExpiresAt(), HOLD_DURATION_SECONDS, "Slot successfully held for " + HOLD_DURATION_SECONDS + " seconds.");
    }

    public void validateSlotCapacity(LocalDate date, String timeSlot, UUID customerId) {
        ScheduleConfiguration config = configurationRepository.findConfigurationsForDate(date).stream()
                .findFirst()
                .orElseGet(() -> configurationRepository.findFirstByStatus(ScheduleStatus.CURRENT).orElse(null));
        int slotCapacity = (config != null && config.getSlotCapacity() != null && config.getSlotCapacity() > 0) ? config.getSlotCapacity() : 1;

        Instant now = Instant.now();
        long bookedCount = serviceRequestRepository.countActiveBookingsByDateAndTimeSlot(date, timeSlot);
        List<SlotHold> activeHolds = slotHoldRepository.findActiveHoldsByDateAndTimeSlot(date, timeSlot, now);
        long otherHoldsCount = activeHolds.stream()
                .filter(h -> customerId == null || !h.getCustomer().getUserId().equals(customerId))
                .count();

        if (bookedCount + otherHoldsCount >= slotCapacity) {
            throw new IllegalStateException("This time slot is fully booked. Please choose another slot.");
        }
    }

    private LocalTime parseSlotStartTime(String timeSlot) {
        if (timeSlot == null || timeSlot.isBlank()) return null;
        try {
            String startStr = timeSlot.split("–|-")[0].trim();
            return LocalTime.parse(startStr, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional
    public void releaseHold(UUID customerId) {
        slotHoldRepository.releaseActiveHoldsByCustomerId(customerId, Instant.now());
    }

    @Transactional(readOnly = true)
    public AdminDailySlotsResponse getAdminDailySlots(UUID configurationId, LocalDate date) {
        ScheduleConfiguration config = configurationRepository.findById(configurationId)
                .orElseThrow(() -> new ScheduleNotFoundException("Schedule configuration not found: " + configurationId));

        String dayOfWeek = date.getDayOfWeek().name();
        int totalCapacity = (config.getSlotCapacity() != null && config.getSlotCapacity() > 0) ? config.getSlotCapacity() : 1;

        if (date.isBefore(config.getStartDate()) || date.isAfter(config.getEndDate())) {
            return new AdminDailySlotsResponse(
                    date,
                    dayOfWeek,
                    false,
                    false,
                    "Date is outside configuration window (" + config.getStartDate() + " to " + config.getEndDate() + ").",
                    config.getSlotDurationMinutes(),
                    totalCapacity,
                    Collections.emptyList()
            );
        }

        if (config.getOperatingDays() == null || !config.getOperatingDays().contains(dayOfWeek)) {
            return new AdminDailySlotsResponse(
                    date,
                    dayOfWeek,
                    false,
                    false,
                    "Workshop is closed on " + dayOfWeek + "s.",
                    config.getSlotDurationMinutes(),
                    totalCapacity,
                    Collections.emptyList()
            );
        }

        Optional<ScheduleBlockedDate> blocked = config.getBlockedDates().stream()
                .filter(b -> b.getBlockedDate().equals(date))
                .findFirst();

        if (blocked.isPresent()) {
            return new AdminDailySlotsResponse(
                    date,
                    dayOfWeek,
                    false,
                    true,
                    blocked.get().getReason(),
                    config.getSlotDurationMinutes(),
                    totalCapacity,
                    Collections.emptyList()
            );
        }

        List<ScheduleBreakDto> dayBreaks = config.getBreaks().stream()
                .filter(b -> b.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                .map(b -> new ScheduleBreakDto(b.getBreakId(), b.getDayOfWeek(), b.getStartTime(), b.getEndTime(), b.getLabel()))
                .toList();

        List<SlotDto> baseSlots = generateSlots(config.getOpeningTime(), config.getClosingTime(), config.getSlotDurationMinutes(), dayBreaks);

        Map<String, Long> bookingCounts = new HashMap<>();
        for (Object[] row : serviceRequestRepository.countActiveBookingsByDateGroupByTimeSlot(date)) {
            String slot = (String) row[0];
            Long count = (Long) row[1];
            bookingCounts.put(slot, count);
        }

        List<AdminSlotDto> adminSlots = baseSlots.stream().map(slot -> {
            if (slot.isBreak()) {
                return new AdminSlotDto(
                        slot.startTime(),
                        slot.endTime(),
                        slot.label(),
                        true,
                        0,
                        0,
                        0,
                        "BREAK"
                );
            }
            int booked = bookingCounts.getOrDefault(slot.label(), 0L).intValue();
            int remaining = Math.max(0, totalCapacity - booked);
            String status = remaining == 0 ? "UNAVAILABLE" : "AVAILABLE";
            return new AdminSlotDto(
                    slot.startTime(),
                    slot.endTime(),
                    slot.label(),
                    false,
                    totalCapacity,
                    booked,
                    remaining,
                    status
            );
        }).toList();

        return new AdminDailySlotsResponse(
                date,
                dayOfWeek,
                true,
                false,
                null,
                config.getSlotDurationMinutes(),
                totalCapacity,
                adminSlots
        );
    }
}

