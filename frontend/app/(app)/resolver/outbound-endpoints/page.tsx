'use client';
import { ResolverInfoPage } from '@/components/layout/ResolverInfoPage';

export default function OutboundEndpointsPage() {
  return (
    <ResolverInfoPage
      title="Outbound endpoints"
      breadcrumbLabel="Outbound endpoints"
      description="Allow Route 53 Resolver to forward DNS queries to DNS resolvers on your network."
      emptyTitle="No outbound endpoints"
      emptyBody="Outbound endpoints allow Route 53 Resolver to forward DNS queries to your on-premises DNS resolvers or other DNS servers. Use outbound endpoints with resolver rules to forward specific domain names to your network's DNS servers."
      docsUrl="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver-forwarding-outbound-queries.html"
    />
  );
}
