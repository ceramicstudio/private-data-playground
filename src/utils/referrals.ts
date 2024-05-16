import { type ScoreReferralInput, type RecipientScore } from "./types";

export const calculateReferrals = async (
  input: ScoreReferralInput,
): Promise<Array<RecipientScore> | { error: string }> => {
  try {
    const { rows, startRow, chron } = input;
    const referralScores = [] as Array<RecipientScore>;

    rows.forEach((row, index) => {
      if (!chron) {
        if (index >= input.startRow) {
          const recipient = row.answers.find(
            (answer) =>
              answer.name === "What is your wallet address? - Wallet Address",
          )?.value;

          const referrals = row.waitlistInfo?.referralCount;
          const score = referrals ? referrals * 100 : 0;
          if (typeof recipient === "string") {
            referralScores.push({
              recipient,
              score,
              context: "Referral",
            });
          }
        }
      } else {
        if (index < startRow) {
          const recipient = row.answers.find(
            (answer) =>
              answer.name === "What is your wallet address? - Wallet Address",
          )?.value;

          const referrals = row.waitlistInfo?.referralCount;
          const score = referrals ? referrals * 100 : 0;
          if (typeof recipient === "string") {
            referralScores.push({
              recipient,
              score,
              context: "Referral",
            });
          }
        }
      }
    });

    // return the recipient scores
    return referralScores;
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};
