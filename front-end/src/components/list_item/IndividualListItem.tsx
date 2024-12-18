import { Tag } from 'antd';
import React from 'react';
import Link from 'next/link';
import { colorMap } from '@/utils/getColor';
import { Person } from '@/lib/individual';

interface IndividualItemProps {
  record: Person;
  showTag: boolean;
  paddingLeft: boolean;
}

export default function IndividualListItem({ record, showTag, paddingLeft }: IndividualItemProps) {
  return (
    <Link className={`text-[#c19d50] ${paddingLeft ? 'ml-10' : ''}`} href={`/individual/${record.id}`}>
      {record.name} {showTag && <Tag color={colorMap["人物"]}>人物</Tag>}
    </Link>
  );
}