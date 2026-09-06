import MentorshipAccess, {
  MentorshipAccessStatus,
} from "../models/mentorship-access.model.js";

// grants or refreshes chat access for a candidate, who successfully paid for a mentor subscription. This operation is intentionally idempotent because RabbitMQ events can be delivered more than once

export const grantMentorshipAccess = async (data: {
  candidateId: string;
  mentorId: string;
  razorpaySubscriptionId: string;
  expiresAt?: Date;
}) => {
  const access = await MentorshipAccess.findOneAndUpdate(
    {
      candidateId: data.candidateId,
      mentorId: data.mentorId,
      razorpaySubscriptionId: data.razorpaySubscriptionId,
    },
    {
      $set: {
        status: MentorshipAccessStatus.ACTIVE,

        expiresAt: data.expiresAt,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  return access;
};

// revokes chat access for a candidate <-> mentor relationship

export const revokeMentorshipAccess = async (
  razorpaySubscriptionId: string,
) => {
  await MentorshipAccess.findOneAndUpdate(
    {
      razorpaySubscriptionId,
    },
    {
      $set: {
        status: MentorshipAccessStatus.REVOKED,
      },
    },
  );
};

// checks whether a candidate currently has access to communicate with a mentor

export const hasMentorshipAccess = async (
  candidateId: string,
  mentorId: string,
) => {
  const access = await MentorshipAccess.findOne({
    candidateId,
    mentorId,
    status: MentorshipAccessStatus.ACTIVE,
  });

  if (!access) {
    return false;
  }

  //   if an expiry date exists and the paid period has ended, the candidate can no longer send new messages

  if (access.expiresAt && access.expiresAt.getTime() <= Date.now()) {
    return false;
  }

  return true;
};
