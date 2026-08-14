'use client';
import { ResolverInfoPage } from '@/components/layout/ResolverInfoPage';

export default function InboundEndpointsPage() {
  return (
    <ResolverInfoPage
      title="Inbound endpoints"
      breadcrumbLabel="Inbound endpoints"
      description="Allow DNS resolvers on your network to forward DNS queries to Route 53 Resolver."
      emptyTitle="No inbound endpoints"
      emptyBody="Inbound endpoints allow DNS resolvers on your on-premises network or other VPCs to forward DNS queries to Route 53 Resolver. Each endpoint requires at least two IP addresses for redundancy, in different Availability Zones."
      docsUrl="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver-forwarding-inbound-queries.html"
    />
  );
}
