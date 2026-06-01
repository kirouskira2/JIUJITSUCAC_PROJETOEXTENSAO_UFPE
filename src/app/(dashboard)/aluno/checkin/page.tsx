import { getSession } from "@/actions/auth";
import { getTodayWorkout } from "@/actions/checkin";
import { CheckinClientPage } from "./checkin-client";

export default async function CheckinPage() {
  const { data: sessionData } = await getSession();
  const profileId = sessionData?.profile.id ?? "";
  const profileName = sessionData?.profile.fullName ?? "";

  const { data: workoutData } = await getTodayWorkout();
  const workoutId = workoutData?.workout?.id ?? null;

  return (
    <CheckinClientPage
      profileId={profileId}
      workoutId={workoutId}
      profileName={profileName}
    />
  );
}
