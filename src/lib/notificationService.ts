import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface SmsDispatchLog {
  id?: string;
  incidentId: string;
  recipientPhone: string;
  recipientName: string;
  message: string;
  dispatchedAt: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  deliveryCarrier: string;
}

class NotificationService {
  /**
   * Dedicated alert method that logs the dispatch of an SMS message to the registered mobile number
   * associated with the citizen who reported the original incident.
   * This updates Firestore persistent collections and synchronizes real-time audit logs.
   */
  public async logSmsDispatchAlert(
    incidentId: string,
    recipientPhone: string,
    recipientName: string,
    message: string
  ): Promise<SmsDispatchLog> {
    const timestamp = new Date().toISOString();
    
    const dispatchLog: SmsDispatchLog = {
      incidentId,
      recipientPhone,
      recipientName,
      message,
      dispatchedAt: timestamp,
      status: 'DELIVERED',
      deliveryCarrier: 'GVMC Telecom Gateway'
    };

    console.log(`[NotificationService] Logging SMS dispatch alert for incident #${incidentId} to ${recipientPhone}`);

    // A. Persist log in Firestore 'sms_notifications' collection for citizen-dashboard and public audit
    if (db) {
      try {
        await addDoc(collection(db, 'sms_notifications'), {
          ...dispatchLog,
          sentAt: timestamp, // backward-compatibility with existing code
          createdAt: serverTimestamp()
        });
        console.log(`[NotificationService] Firestore log created successfully for incident ${incidentId}`);
      } catch (err) {
        console.warn(`[NotificationService] Firestore persistence failed. Falling back. Error:`, err);
      }
    }

    // B. Maintain local fallback storage for guest and mock sessions
    try {
      const existingLogsStr = localStorage.getItem('civiceye_sms_logs') || '[]';
      const existingLogs = JSON.parse(existingLogsStr);
      existingLogs.push({
        id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...dispatchLog,
        sentAt: timestamp
      });
      localStorage.setItem('civiceye_sms_logs', JSON.stringify(existingLogs));
    } catch (err) {
      console.warn(`[NotificationService] LocalStorage fallback write failed:`, err);
    }

    // C. Dispatch a custom web event so any listening website components (like the dashboard) can reflect it immediately
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('gvmcSmsDispatched', {
        detail: { ...dispatchLog, timestamp }
      });
      window.dispatchEvent(event);
    }

    return dispatchLog;
  }
}

export const notificationService = new NotificationService();
