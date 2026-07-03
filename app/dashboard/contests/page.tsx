import ContestTrackerClient from "./ContestTrackerClient";
import { getUpcomingContests } from "./clist";

export default async function ContestsPage() {
  const { contests, error } = await getUpcomingContests();

  return <ContestTrackerClient contests={contests} fetchError={error} />;
}
