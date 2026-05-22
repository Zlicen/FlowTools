import { EmptyState, Panel, SectionHeader } from "../components/ui";

function OverviewTab() {
  return (
    <Panel>
      <SectionHeader
        title="Overview"
        description="Your Resolve project dashboard will live here."
      />

      <EmptyState
        title="Overview tools coming soon"
        description="We can add project stats, active timeline info, missing media checks, proxy status, and quick actions here."
      />
    </Panel>
  );
}

export default OverviewTab;
