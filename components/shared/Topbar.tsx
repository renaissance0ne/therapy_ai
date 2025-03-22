import { OrganizationSwitcher, SignedIn, SignOutButton, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Image from "next/image";
import Link from "next/link";

function Topbar() {
  return (
    <nav className='topbar'>
      <Link href='/' className='flex items-center gap-4'>
        <Image src='/assets/logo.svg' alt='logo' width={48} height={48} />
        <p className='text-heading3-bold text-light-1 max-xs:hidden'>therapyAI</p>
      </Link>

      <div className='flex items-center gap-4'>
        <Link href="/profile" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-dark-3 transition-colors">
          <Image
            src='/assets/profile.svg'
            alt='profile'
            width={24}
            height={24}
          />
          <span className="text-light-1 text-small-medium">Profile</span>
        </Link>
        
        <div className='block'>
          <SignedIn>
            <div className="flex items-center gap-4">
              <UserButton 
                appearance={{
                  baseTheme: dark,
                  elements: {
                    avatarBox: "h-9 w-9"
                  }
                }}
                afterSignOutUrl="/"
              />
              
              <div className='block md:hidden'>
                <SignOutButton>
                  <div className='flex cursor-pointer'>
                    <Image
                      src='/assets/logout.svg'
                      alt='logout'
                      width={24}
                      height={24}
                    />
                  </div>
                </SignOutButton>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}

export default Topbar;