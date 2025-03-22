// "use client";
// import { useState, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import Image from "next/image";

// // Define the TodoItem interface
// interface TodoItem {
//   completed: boolean;
//   task: string;
// }

// const RightSidebar = () => {
//   const pathname = usePathname();
//   const [todoList, setTodoList] = useState<TodoItem[]>([]);
//   const [loading, setLoading] = useState(false);
  
//   useEffect(() => {
//     const fetchTodoList = async () => {
//       // Only fetch if we're on a session page
//       if (!pathname.includes('/session/')) return;
      
//       const sessionId = pathname.split('/session/')[1].split('/')[0];
//       if (!sessionId) return;
      
//       setLoading(true);
      
//       try {
//         const response = await fetch(`/api/sessions/${sessionId}`);
//         const data = await response.json();
        
//         if (data.session && data.session.todoList) {
//           setTodoList(data.session.todoList);
//         }
//       } catch (error) {
//         console.error('Error fetching todo list:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchTodoList();
//   }, [pathname]);
  
//   if (!todoList.length && !loading) {
//     return (
//       <section className='custom-scrollbar rightsidebar'>
//         <div className="flex flex-col gap-4 p-6">
//           <h2 className="text-light-1 text-heading4-medium">Todo List</h2>
//           <div className="bg-dark-3 p-4 rounded-lg">
//             <p className="text-light-3 text-small-regular">
//               Complete your therapy session to get a personalized todo list
//             </p>
//           </div>
//         </div>
//       </section>
//     );
//   }
  
//   return (
//     <section className='custom-scrollbar rightsidebar'>
//       <div className="flex flex-col gap-4 p-6">
//         <h2 className="text-light-1 text-heading4-medium">Your Todo List</h2>
        
//         {loading ? (
//           <div className="flex justify-center py-4">
//             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
//           </div>
//         ) : (
//           <div className="flex flex-col gap-3">
//             {todoList.map((item, index) => (
//               <div key={index} className="bg-dark-3 p-3 rounded-lg">
//                 <div className="flex items-start gap-3">
//                   <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
//                     item.completed ? 'bg-primary-500' : 'border border-light-3'
//                   }`}>
//                     {item.completed && (
//                       <Image 
//                         src="/assets/check.svg" 
//                         alt="completed" 
//                         width={12} 
//                         height={12} 
//                       />
//                     )}
//                   </div>
//                   <div className="flex-1">
//                     <p className={`text-small-regular ${item.completed ? 'text-light-3 line-through' : 'text-light-1'}`}>
//                       {item.task}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
            
//             {todoList.length > 0 && (
//               <div className="mt-4">
//                 <p className="text-light-3 text-subtle-medium">
//                   Complete these tasks to improve your mental wellbeing
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default RightSidebar;