export const highlightText = (text: string, highlight: string) => {
  const regex = new RegExp(`(${highlight})`, 'gi');
  return text.split(regex).map((part, index) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <span key={index} className='text-[#c19d50]'>{part}</span>
    ) : (
      part
    )
  );
};