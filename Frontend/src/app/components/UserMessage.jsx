// import React from 'react';

// export default function UserMessage({ message }) {
//   return (
//     <div className="flex justify-end my-6">
//       <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl max-w-[75%] shadow-sm text-lg rounded-br-sm leading-relaxed">
//         {message}
//       </div>
//     </div>
//   );
// }



import React from 'react';

export default function UserMessage({ message }) {
  return (
    <div className="flex justify-end my-6 px-2">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 rounded-2xl max-w-[75%] shadow-lg text-lg rounded-br-sm leading-relaxed backdrop-blur-md">
        {message}
      </div>
    </div>
  );
}