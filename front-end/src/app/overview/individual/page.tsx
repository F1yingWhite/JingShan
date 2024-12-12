'use client'
import React, { useEffect } from 'react'
import { getAllIndividuals, getIndividualHybrid, getPlaceList, getWorksList, Person } from '@/lib/individual'
import { useRouter } from 'next/navigation';
import { Button, Checkbox, Col, Input, Row } from 'antd';
import Search from 'antd/es/input/Search';
import { SearchOutlined } from '@ant-design/icons';

export default function Page() {
  const router = useRouter();
  const [name, setName] = React.useState<string>('');
  const [workValues, setWorkValues] = React.useState<string[]>([]);
  const [selectedWork, setSelectedWork] = React.useState<string[]>([]);
  const [locationValues, setLocationValues] = React.useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = React.useState<string[]>([]);
  const [individuals, setIndividuals] = React.useState<Person[]>([]);

  useEffect(() => {
    getAllIndividuals(1, 10, '').then((data) => {
      setIndividuals(data);
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
    getIndividualHybrid(selectedLocation, selectedWork, name, 1, 20).then((data) => {
      setIndividuals(data.data);
      console.log(data);
    });
  }

  return (
    <div className='flex flex-row w-full h-[100vh] overflow-auto p-6'>
      <div className='w-1/4 h-full flex flex-col text-[#1A2B5C] pr-6'>
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
      <div className='w-3/4 bg-blue-200 h-full'></div>
    </div>
  )
}