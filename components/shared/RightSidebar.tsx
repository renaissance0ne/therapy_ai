import { currentUser } from "@clerk/nextjs/server";


async function RightSidebar() {
  const user = await currentUser();
  if (!user) return null;


  return (
    <section className='custom-scrollbar rightsidebar'>
    </section>
  );
}

export default RightSidebar;