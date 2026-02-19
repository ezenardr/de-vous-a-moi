"use client";
import Image from "next/image";
import User4Fill from "@/assets/icons/User4Fill.svg";
import CloseIcon from "@/assets/icons/CloseIcon.svg";
import { useSession } from "next-auth/react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import {
  EditProfileComponent,
  NotificationComponent,
  ProfileComponent,
  SecurityComponent,
  UploadProfilePictureComponent,
} from "./ProfileDialog";
import { useState } from "react";
import { User } from "@/types/types";
import { motion } from "framer-motion";

export default function ProfileDrawer() {
  const { data: session } = useSession();
  const user = session?.user;
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;
  return (
    <Drawer direction="bottom">
      <DrawerTrigger className="flex items-center gap-4 cursor-pointer p-4">
        {session?.user.profileImageUrl ? (
          <Image
            src={session.user.profileImageUrl}
            alt={session.user.firstName}
            width={20}
            height={20}
            className="rounded-full"
          />
        ) : (
          <Image src={User4Fill} alt="User 4 Fill" width={16} height={18} />
        )}
        <span className="text-[1.4rem] leading-[145%] text-[#333333]">
          {session?.user.firstName} {session?.user.lastName}
        </span>
      </DrawerTrigger>
      <DrawerContent className="bg-[#F9F9F9] h-full overflow-hidden">
        <DrawerHeader>
          <DrawerTitle className="sr-only">Mobile navigation menu</DrawerTitle>
          <DrawerDescription className="sr-only">
            Drawer for mobile navigation menu
          </DrawerDescription>
        </DrawerHeader>
        <DrawerClose className="self-end">
          <Image src={CloseIcon} alt="CloseIcon" width={40} height={40} />
        </DrawerClose>
        {currentStep === 0 && (
          <div className="flex flex-col gap-20 w-full h-full overflow-x-hidden">
            <UploadProfilePictureComponent user={user as User} />
            <div className="w-full flex flex-col gap-10 overflow-x-hidden">
              <ProfileComponent
                user={user as User}
                setCurrentStep={setCurrentStep}
                setPreviousStep={setPreviousStep}
              />
              <div className="h-px w-full bg-[#E8E8E8]"></div>
              <SecurityComponent />
              <div className="h-px w-full bg-[#E8E8E8]"></div>
              <NotificationComponent user={user as User} />
            </div>
          </div>
        )}
        {currentStep === 1 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            layout={false}
            className="h-full overflow-hidden flex flex-col gap-10"
          >
            {/* <DialogTitle>Modifier votre profil</DialogTitle> */}
            <EditProfileComponent
              user={user as User}
              setCurrentStep={setCurrentStep}
              setPreviousStep={setPreviousStep}
            />
          </motion.div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
