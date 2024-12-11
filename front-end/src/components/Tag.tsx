import React from 'react'

interface TagProps {
  text: string;
  color: string;
  opacity: number;
  textColor?: string;
}

export default function Tag({ text, color, opacity, textColor = 'white' }: TagProps) {
  const backgroundColor = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${opacity})`;

  return (
    <span className='rounded-md p-1 inline text-center' style={{ backgroundColor: backgroundColor, color: textColor }}>
      {text}
    </span>
  )
}