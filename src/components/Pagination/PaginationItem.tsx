import { Button } from '@chakra-ui/react';

interface PaginationItemProps {
  number: number;
  isCurrent?: boolean;
  onPageChange: (page: number) => void;
}

export function PaginationItem({
  isCurrent = false,
  number,
  onPageChange,
}: PaginationItemProps) {
  if (!isCurrent) {
    return (
      <Button
        size="sm"
        fontSize="xs"
        width="4"
        onClick={() => {
          onPageChange(number);
        }}
      >
        {number}
      </Button>
    );
  }
  return (
    <Button
      size="sm"
      fontSize="xs"
      width="4"
      colorScheme="brand"
      disabled
      _disabled={{
        cursor: 'default',
      }}
    >
      {number}
    </Button>
  );
}
