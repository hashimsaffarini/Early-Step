import { Search } from 'lucide-react';

import { Input, type InputProps } from '@/components/ui/Field';

export interface SearchFieldProps extends Omit<InputProps, 'type' | 'leadingIcon'> {
  /** Accessible name (a search box has no visible label). */
  label: string;
}

export function SearchField({ label, ...rest }: SearchFieldProps) {
  return (
    <div role="search">
      <Input type="search" aria-label={label} leadingIcon={<Search />} {...rest} />
    </div>
  );
}
