import { getSessionUser } from "@/lib/session";
import { listUserNotifications } from "@/server/views/notifications";
import { NotificationsClient } from "@/components/driver/notifications-client";

export default async function NotificationsPage() {
  const session = await getSessionUser();
  const notifications = await listUserNotifications(session!.id);

  return <NotificationsClient notifications={notifications} />;
}
