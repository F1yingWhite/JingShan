'use client'
import React, { useEffect } from 'react'
import { getIndividualHybrid, getPlaceList, getWorksList, Person } from '@/lib/individual'
import { useRouter } from 'next/navigation';
import { Button, Checkbox, Col, Input, Pagination, Row } from 'antd';
import Search from 'antd/es/input/Search';
import { SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';

export default function Page() {
  const [name, setName] = React.useState<string>('');
  const [workValues, setWorkValues] = React.useState<string[]>([]);
  const [selectedWork, setSelectedWork] = React.useState<string[]>([]);
  const [locationValues, setLocationValues] = React.useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = React.useState<string[]>([]);
  const [individuals, setIndividuals] = React.useState<Person[]>([]);
  const [pageSize, setPageSize] = React.useState<number>(100);
  const [totalNum, setTotalNum] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  useEffect(() => {
    getIndividualHybrid(locationValues, workValues, name, currentPage, pageSize).then((data) => {
      setIndividuals(data.data.data);
      setTotalNum(data.data.total);
    });
    getPlaceList('').then((data) => {
      setLocationValues(data);
    });
    getWorksList('').then((data) => {
      setWorkValues(data);
    });
  }, [])

  const checkboxes = [];
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    checkboxes.push(
      <Checkbox key={letter} value={letter} className='block'>
        {letter}
      </Checkbox>
    );
  }

  const onShowSizeChange = (current, pageSize) => {
    setPageSize(pageSize);
    setCurrentPage(current);
    getIndividualHybrid(selectedLocation, selectedWork, name, current, pageSize).then((data) => {
      setIndividuals(data.data.data);
      setTotalNum(data.data.total);
    });
  }

  const handleWorkChange = (checkedValues) => {
    setSelectedWork(checkedValues);
  }

  const handleLocationChange = (checkedValues) => {
    setSelectedLocation(checkedValues);
  }

  const handlePlaceSearch = (value) => {
    getPlaceList(value).then((data) => {
      setLocationValues(data);
    });
  }

  const handleSearch = () => {
    setCurrentPage(1);
    getIndividualHybrid(selectedLocation, selectedWork, name, 1, pageSize).then((data) => {
      setIndividuals(data.data.data);
      setTotalNum(data.data.total);
    });
  }

  return (
    <div className='flex flex-col sm:flex-row w-full h-[100vh] p-6'>
      <div className='sm:w-full md:w-1/4 h-full flex flex-col text-[#1A2B5C] pr-6'>
        <div>
          <span className='mb-1 mr-2'>精确筛选</span>
          <SearchOutlined
            style={{
              fontSize: '1rem',
            }}
            onClick={handleSearch}
          />
        </div>
        <div className='h-px bg-gray-400'></div>
        <div className='flex flex-row mt-4 justify-between'>
          <span>姓名:</span>
          <Input
            allowClear
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '60%' }}
          />
        </div>

        <div className='h-px mt-4 mb-2 bg-gray-400'></div>
        <span className='text-[#1A2B5C] mb-1'>参与事件</span>
        <span className='text-sm mb-1'>
          已选择{' '}
          <span className='font-semibold'>
            {workValues.length}
          </span>
          {' '}项
        </span>
        <div className='w-full flex rounded-lg p-2 border'>
          <Checkbox.Group style={{ width: '100%' }} onChange={handleWorkChange}>
            {workValues.map((work) => (
              <div className='w-full pl-3'>
                <Checkbox key={work} value={work} className='block'>
                  {work}
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        </div>

        <div className='h-px mt-4 mb-2 bg-gray-400'></div>
        <span className='text-[#1A2B5C] mb-1'>地点</span>
        <Search allowClear style={{ width: '100' }} onSearch={handlePlaceSearch} />
        <span className='text-sm mb-1 mt-1'>
          已选择{' '}
          <span className='font-semibold'>
            {locationValues.length}
          </span>
          {' '}项
        </span>
        <div className="w-full flex rounded-lg p-2 overflow-auto border auto max-h-[500px]">
          <Checkbox.Group style={{ width: '100%', height: "auto" }} onChange={handleLocationChange}>
            {locationValues.map((location) => (
              <div className='w-full pl-3'>
                <Checkbox key={location} value={location} className='block'>
                  {location}
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        </div>

      </div>
      <div className='sm:w-full md:w-3/4 h-full'>
        <span className='text-base text-[#1A2B5C] pb-6'>共 {totalNum}条结果</span>
        <div className='flex flex-col w-full items-center pb-8'>
          {
            individuals.length > 0 && (
              <div className="flex flex-wrap">
                {individuals.map((individual) => (
                  <Link
                    key={individual.id}
                    href={`/individual/${individual.id}`}
                    className={`p-2 box-border ${individuals.length <= 2 ? 'w-1/2' : 'w-1/2 lg:w-1/3'}`}
                  >
                    {individual.name}
                  </Link>
                ))}
              </div>
            )
          }
          <Pagination
            responsive={true}
            current={currentPage}
            showSizeChanger
            pageSize={pageSize}
            onChange={onShowSizeChange}
            total={totalNum}
          />
        </div>
      </div>
    </div>

  )
}