export enum UserEventType {
  USER_REGISTERED = "USER_REGISTERED",
  RESEND_OTP = "RESEND_OTP",
  PASSWORD_RESET = "PASSWORD_RESET",
  ACCOUNT_DELETION_REQUESTED = "ACCOUNT_DELETION_REQUESTED",
}

export enum InterviewEventType {
  INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED",
  INTERVIEW_UPDATED = "INTERVIEW_UPDATED",
  INTERVIEW_DELETED = "INTERVIEW_DELETED",
  INTERVIEW_COMPLETED = "INTERVIEW_COMPLETED",
}

// events related to paid mentor subscriptions - these events are published by the Payment Service and consumed by services that need to react to subscription/access changes

export enum MentorshipEventType {
  MENTORSHIP_ACCESS_GRANTED = "MENTORSHIP_ACCESS_GRANTED",
  MENTORSHIP_ACCESS_REVOKED = "MENTORSHIP_ACCESS_REVOKED",
}
