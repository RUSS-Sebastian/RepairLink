import { useCustomerNotifications as useCustomerNotificationHook } from "../context/CustomerNotificationContext";

export function useCustomerNotifications() {
  return useCustomerNotificationHook();
}
