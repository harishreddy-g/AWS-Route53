'use client';
import { ResolverInfoPage } from '@/components/layout/ResolverInfoPage';

export default function RulesPage() {
  return (
    <ResolverInfoPage
      title="Rules"
      breadcrumbLabel="Rules"
      description="Define rules that Route 53 Resolver uses to route DNS queries to your DNS resolvers."
      emptyTitle="No resolver rules"
      emptyBody="Resolver rules define how Route 53 Resolver forwards DNS queries to your network's DNS resolvers. You can create forwarding rules to route specific domain name queries to IP addresses that you specify, and system rules that override how Resolver routes traffic for selected domains."
      docsUrl="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver-rules-managing.html"
    />
  );
}
