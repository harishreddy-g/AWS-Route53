export const DOMAIN_PATTERN = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export const HOSTED_ZONE_DESCRIPTION_MAX = 500;

export interface HostedZoneFormValues {
  name: string;
  description: string;
  zoneType?: 'public' | 'private';
}

export interface HostedZoneFormErrors {
  name?: string;
  description?: string;
}

export function validateHostedZoneForm(data: HostedZoneFormValues): HostedZoneFormErrors {
  const errors: HostedZoneFormErrors = {};
  const name = data.name.trim();

  if (!name) {
    errors.name = 'Zone name is required';
  } else if (name.length < 3) {
    errors.name = 'Zone name must be at least 3 characters';
  } else if (!DOMAIN_PATTERN.test(name)) {
    errors.name = 'Enter a valid domain name (e.g., example.com)';
  }

  if (data.description.length > HOSTED_ZONE_DESCRIPTION_MAX) {
    errors.description = `Description must be ${HOSTED_ZONE_DESCRIPTION_MAX} characters or less`;
  }

  return errors;
}
