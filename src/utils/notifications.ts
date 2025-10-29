/**
 * Email notification system (mock)
 */

export interface NotificationOptions {
  to: string[];
  subject: string;
  body: string;
  type?: 'email' | 'in_app';
}

export async function sendNotification(options: NotificationOptions): Promise<boolean> {
  // Mock email sending - in real app, this would call an email service
  console.log('📧 Mock Email Notification:', {
    to: options.to.join(', '),
    subject: options.subject,
    body: options.body.substring(0, 100) + '...',
  });

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Store notification in localStorage for "in_app" type
  if (options.type === 'in_app') {
    const notifications = JSON.parse(localStorage.getItem('talentflow_notifications') || '[]');
    notifications.push({
      ...options,
      id: Date.now(),
      read: false,
      createdAt: Date.now(),
    });
    localStorage.setItem('talentflow_notifications', JSON.stringify(notifications.slice(-50))); // Keep last 50
  }

  return true;
}

export async function notifyCandidateStageChange(
  candidateEmail: string,
  candidateName: string,
  newStage: string
): Promise<void> {
  await sendNotification({
    to: [candidateEmail],
    subject: `Update on your application`,
    body: `Hi ${candidateName}, your application status has been updated to: ${newStage}`,
    type: 'email',
  });
}

export async function notifyNewJobPosting(recipients: string[], jobTitle: string): Promise<void> {
  await sendNotification({
    to: recipients,
    subject: `New job posting: ${jobTitle}`,
    body: `A new position "${jobTitle}" has been posted. Check it out!`,
    type: 'email',
  });
}

export async function notifyMention(recipientEmail: string, mentionerName: string, note: string): Promise<void> {
  await sendNotification({
    to: [recipientEmail],
    subject: `${mentionerName} mentioned you in a note`,
    body: `You were mentioned in a note: "${note}"`,
    type: 'in_app',
  });
}

export function getInAppNotifications(): Array<NotificationOptions & { id: number; read: boolean; createdAt: number }> {
  return JSON.parse(localStorage.getItem('talentflow_notifications') || '[]');
}

export function markNotificationAsRead(id: number): void {
  const notifications = getInAppNotifications();
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem('talentflow_notifications', JSON.stringify(updated));
}


