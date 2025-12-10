"use client"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from 'next/navigation';

const LoginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});
type TLoginSchema = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<TLoginSchema>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
  });
  const onSubmit = async (data: TLoginSchema) => {
    if (data.email==="jeanbaptisteedshy@gmail.com" && data.password==="123456"){
      console.log('welcome back')
      redirect('/');
    }
    else{
      console.log('sorry try again maybe with another email or password')
    }
    console.log("Formulaire soumis:", data);
    await (data);
    reset();
  };

  return <div>
    <div  className="flex flex-col gap-[25px]">
      <div  className="flex flex-col gap-[15px] font-secondary text-center">
        <h3 className="text-[32px] font-bold leading-[120%] tracking-[-0.96px]">Welcome back</h3>
        <p className="text-[16px] font-normal leading-[145%] tracking-[-0.48px] text-[#A3A3A3]">Pick up where you left off — your saved reads, your reflections, your space.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col font-secondary tracking-[-0.42px]">
          <div className="flex flex-col gap-[5px] mb-[15px]">
            <input
                type="email"
                {...register('email')}
                placeholder="Email address"
                className="bg-[#F8F8F8] px-3.5 py-[18px] text-[14px] text-[#767676] rounded-[5px]
                focus:border focus:border-[#9FE870] focus:outline-none
                focus-visible:border-primary-base focus-visible:ring-2 focus-visible:ring-[#9FE870]"
                required
            />
            {errors.email && <p className="text-[#cc0000]">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-[5px]">
            <input
                type="password"
                {...register('password')}
                placeholder="Password"
                className="bg-[#F8F8F8] px-3.5 py-[18px] text-[14px] text-[#767676] rounded-[5px]
                focus:border focus:border-[#9FE870] focus:outline-none
                focus-visible:border-primary-base focus-visible:ring-2 focus-visible:ring-[#9FE870]"
                required
            />
            {errors.password && <p className="text-[#cc0000]">{errors.password.message}</p>}
            <a className="text-[14px] text-end font-bold leading-[145%] tracking-[-0.42px] mt-2.5">Reset password</a>
          </div>
        </div>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full rounded-[5px] bg-[#9FE870] font-secondary text-[16px] font-bold tracking-[-0.48px] text-primary-base leading-[145%] px-[25px] py-[15px] mt-[25px] disabled:bg-[#E8E8E8] disabled:text-white  disabled:cursor-not-allowed">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>

    <div className="flex flex-col gap-[30px] mt-[30px] mb-[15px] text-center leading-[145%] tracking-[-0.48px]">
      <p className="font-primary text-[16px] text-neutral-500">or</p>
      <button  className="w-full bg-black rounded-[5px] text-[16px] font-medium text-white px-[24] py-[16]">Continue with Google</button>
    </div>

    <div className="flex gap-[5px] justify-center font-secondary leading-[145%]">
      <p className="text-[16px] font-medium tracking-[-0.48px] text-[#A3A3A3]">Don’t own an account?</p>
      <a className="text-[14px] font-bold tracking-[-0.42px] text-primary-base flex items-center ">Sign up</a>
    </div>
  </div>;
}
