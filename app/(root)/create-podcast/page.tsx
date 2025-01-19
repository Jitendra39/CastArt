"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import GeneratePodcast from "@/components/GeneratePodcast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/components/ui/use-toast";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
// import { VoiceType } from "@/types";
import { VoiceType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import GenerateThumbnail from "@/components/GenerateThumbnail";

const formSchema = z.object({
  podcastTitle: z.string().min(1, "Podcast Title is required"),
  podcastDescription: z.string().min(1, "Podcast Description is required"),
});

// const voiceCategories = ["alloy", "shimmer", "nova", "echo", "fable", "onyx"];
const languages = [
  {
      language: "English (United States)",
      code: "en-US"
  },
  {
      language: "English (United Kingdom)",
      code: "en-GB"
  },
  {
      language: "English (Australia)",
      code: "en-AU"
  },
  {
      language: "Spanish (Spain)",
      code: "es-ES"
  },
  {
      language: "Spanish (Mexico)",
      code: "es-MX"
  },
  {
      language: "French (France)",
      code: "fr-FR"
  },
  {
      language: "French (Canada)",
      code: "fr-CA"
  },
  {
      language: "German (Germany)",
      code: "de-DE"
  },
  {
      language: "Hindi (India)",
      code: "hi-IN"
  },
  {
      language: "Bengali (India)",
      code: "bn-IN"
  },
  {
      language: "Japanese (Japan)",
      code: "ja-JP"
  },
  {
      language: "Korean (South Korea)",
      code: "ko-KR"
  },
  {
      language: "Mandarin Chinese (China Mainland)",
      code: "zh-CN"
  },
  {
      language: "Portuguese (Brazil)",
      code: "pt-BR"
  },
  {
      language: "Russian (Russia)",
      code: "ru-RU"
  },
  {
      language: "Arabic (Various regions)",
      code: "ar-SA" // Add other regional codes if necessary
  },
  {
      language: "Italian (Italy)",
      code: "it-IT"
  },
  {
      language: "Dutch (Netherlands)",
      code: "nl-NL"
  }
];



const CreatePodcast = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [audioUrl, setAudioUrl] = useState("");
  const [audioDuration, setAudioDuration] = useState(0);
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [imagePrompt, setImagePrompt] = useState("");
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [voicePrompt, setVoicePrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const createPodcast = useMutation(api.podcast.createPodcast);
  const [voiceType, setVoiceType] = useState<VoiceType | null>();
  // const [finalTypes, setFinalTypes] = useState<{ voiceId: any; voiceName: any; gender: string; voiceType: any; language: any }[]>([]);
  const [voiceCategories, setVoiceCategories] = useState<{ voiceId: string; voiceName: string }[]>([]);
  const [finalTypes, setFinalTypes] = useState<{ voiceId: string; voiceName: string; gender: string; voiceType: string; language: string }[]>([]);
  // const [voiceCategories, setVoiceCategories] = useState();

  // const [voiceIdNameMap, setVoiceIdNameMap] = useState<Record<string, string>>({});

  // console.log("voiceType", voiceType);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  });

  const handleCreatePodcast = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      if (!audioUrl || !imageUrl || !voiceType) {
        toast({
          title: "Please generate audio and image",
        });
        
        setIsSubmitting(false);
        return;
      }
      const podcast = await createPodcast({
        audioStorageId: audioStorageId as Id<"_storage">,
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioUrl,
        imageUrl,
        imageStorageId: imageStorageId as Id<"_storage">,
        voiceType: voiceType as VoiceType,
        voicePrompt,
        imagePrompt,
        views: 0,
        audioDuration,
      });
      toast({
        title: "CastArt created successfully",
      });
      setIsSubmitting(false);
      router.push(`/podcast/${podcast}`);
    } catch (error) {
      console.error("Error creating podcast", error);
      toast({
        title: "Error creating podcast",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };


  const getVoices = async (data: VoiceType) => {
    setVoiceType(data);
    try {
      const response = await fetch(`/api/languages?code=${data}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const resData = await response.json();
      console.log("resData", resData);
      console.log("voiceCategories", voiceType);
      setVoiceCategories(resData);
    } catch (error) {
      console.error("Error fetching voices:", error);
    }
  };

  const FinalTypes = async(data: VoiceType) =>{
    const voice = voiceCategories.find((voice) => voice.voiceId === data )
    const gender = voice?.voiceId.includes("A") ? "female" : voice?.voiceId.includes("C") ? "female" : "male";
    const language = languages.find((lan) => lan.code === voiceType)?.language || "";
    // setFinalTypes([...finalTypes, { voiceId: voice?.voiceId, voiceName: voice?.voiceName, gender: gender, voiceType: voiceType, language }]);

    if (voice?.voiceId && voice?.voiceName && voiceType) {
      setFinalTypes([...finalTypes, { voiceId: voice.voiceId, voiceName: voice.voiceName, gender: gender, voiceType: voiceType, language }]);
    }
  }

  return (
    <section className="mt-10 flex flex-col">
      <h1 className="text-20 font-bold text-white-1">Create a Podcast</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCreatePodcast)}
          className="mt-12 flex w-full flex-col"
        >
          <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
            <FormField
              control={form.control}
              name="podcastTitle"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Podcast title
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="input-class focus-visible:ring-offset-orange-1"
                      placeholder="Podcast Title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2.5">
              <Label className="text-16 font-bold text-white-1">
                Select Language
              </Label>
              <Select
                onValueChange={(value) => getVoices(value as VoiceType)}
              >
                <SelectTrigger
                  className={cn(
                    "text-16 w-full border-none bg-black-1 text-gray-1 focus:ring-offset-orange-1",
                    { "text-white-1": voiceType }
                  )}
                >
                  <SelectValue
                    placeholder="Select Language"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none bg-black-1 font-bold text-white-1 focus:ring-offset-orange-1">
                  {languages.map((lan, index) => (
                    <SelectItem
                      key={index}
                      value={lan.code as VoiceType}
                      className="capitalize focus:bg-orange-1"
                    >
                      {`${lan.language}`}
                    </SelectItem>
                  ))}
                </SelectContent>
                {voiceType && (
                  <audio
                    src={`/${voiceType}.mp3`}
                    autoPlay
                    controls
                    className="hidden"
                  />
                )}
              </Select>
            </div>









           {voiceCategories.length > 1 && (
            <div className="flex flex-col gap-2.5">
            <Label className="text-16 font-bold text-white-1">
              Select AI Voice
            </Label>
            <Select
              onValueChange={(value) => FinalTypes(value as VoiceType)}
            >
              <SelectTrigger
                className={cn(
                  "text-16 w-full border-none bg-black-1 text-gray-1 focus:ring-offset-orange-1",
                  { "text-white-1": voiceType }
                )}
              >
                <SelectValue
                  placeholder="Select AI Voice"
                  className="placeholder:text-gray-1"
                />
              </SelectTrigger>
              <SelectContent className="text-16 border-none bg-black-1 font-bold text-white-1 focus:ring-offset-orange-1">
                {voiceCategories?.map((voice: { voiceId: string; voiceName: string }, index: number) => (
                  <SelectItem
                    key={voice.voiceId}
                    value={voice.voiceId as VoiceType}
                    className="capitalize focus:bg-orange-1"
                  >
                    {`${voice.voiceName}(${index == 0 ? 'Female' : voiceCategories.length == 4 ? index == 1 ? 'Female' : 'Male' : 'Male'})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           )}








            
            <FormField
              control={form.control}
              name="podcastDescription"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="input-class focus-visible:ring-offset-orange-1"
                      placeholder="Write a short description about the podcast"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col pt-10">
            <GeneratePodcast
              setAudioStorageId={setAudioStorageId}
              setAudio={setAudioUrl}
              voiceType={voiceType!}
              audio={audioUrl}
              voicePrompt={voicePrompt}
              setVoicePrompt={setVoicePrompt}
              setAudioDuration={setAudioDuration}
              finalTypes={finalTypes}
              setFinalTypes={setFinalTypes}
            />

            <GenerateThumbnail
              setImage={setImageUrl}
              setImageStorageId={setImageStorageId}
              image={imageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
            />
            <div className="mt-10 w-full">
              <Button
                type="submit"
                className="text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit & publish podcast"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default CreatePodcast














// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation } from "convex/react";
// import { Loader } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

// import GeneratePodcast from "@/components/GeneratePodcast";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// // import { useToast } from "@/components/ui/use-toast";
// import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
// import { cn } from "@/lib/utils";
// // import { VoiceType } from "@/types";
// import { VoiceType } from "@/types";
// import { useToast } from "@/hooks/use-toast";
// import GenerateThumbnail from "@/components/GenerateThumbnail";

// const formSchema = z.object({
//   podcastTitle: z.string().min(1, "Podcast Title is required"),
//   podcastDescription: z.string().min(1, "Podcast Description is required"),
// });

// const voiceCategories = ["alloy", "shimmer", "nova", "echo", "fable", "onyx"];

// const CreatePodcast = () => {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [audioUrl, setAudioUrl] = useState("");
//   const [audioDuration, setAudioDuration] = useState(0);
//   const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
//     null
//   );
//   const [imagePrompt, setImagePrompt] = useState("");
//   const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
//     null
//   );
//   const [voicePrompt, setVoicePrompt] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [imageUrl, setImageUrl] = useState("");
//   const createPodcast = useMutation(api.podcast.createPodcast);
//   const [voiceType, setVoiceType] = useState<VoiceType | null>();
//   console.log("voiceType", voiceType);

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       podcastTitle: "",
//       podcastDescription: "",
//     },
//   });

//   const handleCreatePodcast = async (data: z.infer<typeof formSchema>) => {
//     try {
//       setIsSubmitting(true);
//       if (!audioUrl || !imageUrl || !voiceType) {
//         toast({
//           title: "Please generate audio and image",
//         });
//         setIsSubmitting(false);
//         return;
//       }
//       const podcast = await createPodcast({
//         audioStorageId: audioStorageId as Id<"_storage">,
//         podcastTitle: data.podcastTitle,
//         podcastDescription: data.podcastDescription,
//         audioUrl,
//         imageUrl,
//         imageStorageId: imageStorageId as Id<"_storage">,
//         voiceType: voiceType as VoiceType,
//         voicePrompt,
//         imagePrompt,
//         views: 0,
//         audioDuration,
//       });
//       toast({
//         title: "Podcast created successfully",
//       });
//       setIsSubmitting(false);
//       router.push(`/podcast/${podcast}`);
//     } catch (error) {
//       console.error("Error creating podcast", error);
//       toast({
//         title: "Error creating podcast",
//         variant: "destructive",
//       });
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <section className="mt-10 flex flex-col">
//       <h1 className="text-20 font-bold text-white-1">Create a Podcast</h1>
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(handleCreatePodcast)}
//           className="mt-12 flex w-full flex-col"
//         >
//           <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
//             <FormField
//               control={form.control}
//               name="podcastTitle"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col gap-2.5">
//                   <FormLabel className="text-16 font-bold text-white-1">
//                     Podcast title
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       className="input-class focus-visible:ring-offset-orange-1"
//                       placeholder="Podcast Title"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="flex flex-col gap-2.5">
//               <Label className="text-16 font-bold text-white-1">
//                 Select AI Voice
//               </Label>
//               <Select
//                 onValueChange={(value) => setVoiceType(value as VoiceType)}
//               >
//                 <SelectTrigger
//                   className={cn(
//                     "text-16 w-full border-none bg-black-1 text-gray-1 focus:ring-offset-orange-1",
//                     { "text-white-1": voiceType }
//                   )}
//                 >
//                   <SelectValue
//                     placeholder="Select AI Voice"
//                     className="placeholder:text-gray-1"
//                   />
//                 </SelectTrigger>
//                 <SelectContent className="text-16 border-none bg-black-1 font-bold text-white-1 focus:ring-offset-orange-1">
//                   {voiceCategories.map((category, index) => (
//                     <SelectItem
//                       key={index}
//                       value={category as VoiceType}
//                       className="capitalize focus:bg-orange-1"
//                     >
//                       {category}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//                 {voiceType && (
//                   <audio
//                     src={`/${voiceType}.mp3`}
//                     autoPlay
//                     controls
//                     className="hidden"
//                   />
//                 )}
//               </Select>
//             </div>
//             <FormField
//               control={form.control}
//               name="podcastDescription"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col gap-2.5">
//                   <FormLabel className="text-16 font-bold text-white-1">
//                     Description
//                   </FormLabel>
//                   <FormControl>
//                     <Textarea
//                       className="input-class focus-visible:ring-offset-orange-1"
//                       placeholder="Write a short description about the podcast"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//           <div className="flex flex-col pt-10">
//             <GeneratePodcast
//               setAudioStorageId={setAudioStorageId}
//               setAudio={setAudioUrl}
//               voiceType={voiceType!}
//               audio={audioUrl}
//               voicePrompt={voicePrompt}
//               setVoicePrompt={setVoicePrompt}
//               setAudioDuration={setAudioDuration}
//             />

//             <GenerateThumbnail
//               setImage={setImageUrl}
//               setImageStorageId={setImageStorageId}
//               image={imageUrl}
//               imagePrompt={imagePrompt}
//               setImagePrompt={setImagePrompt}
//             />
//             <div className="mt-10 w-full">
//               <Button
//                 type="submit"
//                 className="text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-2"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader size={20} className="animate-spin" />
//                     Submitting...
//                   </>
//                 ) : (
//                   "Submit & publish podcast"
//                 )}
//               </Button>
//             </div>
//           </div>
//         </form>
//       </Form>
//     </section>
//   );
// };

// export default CreatePodcast;

























// "use client"

// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"

// import { Button } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { cn } from "@/lib/utils"
// import { useState } from "react"

 
// const voiceCategories = ['alloy', 'shimmer', 'nova', 'echo', 'fable', 'onyx'];

// const formSchema = z.object({
//   username: z.string().min(2, {
//     message: "Username must be at least 2 characters.",
//   }),
// })

// export function CreatePodcast() {
  
//   const [voiceType , setVoiceType] = useState<string | null>(null)
//   // 1. Define your form.
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       username: "",
//     },
//   })
 
//   // 2. Define a submit handler.
//   function onSubmit(values: z.infer<typeof formSchema>) {
//     // Do something with the form values.
//     // ✅ This will be type-safe and validated.
//     console.log(values)
//   }

//   return (
//     <section className="mt-10 flex flex-col ">
//   <h1 className="text-20 font-bold text-white-1">create Podcast</h1>
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="mt-12 flex w-full flex-col">
//         <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
//         <FormField
//           control={form.control}
//           name="podcastTitle"
//           render={({ field }) => (
//             <FormItem className="flex flex-col gap-2.5">
//               <FormLabel className="text-white-1">Username</FormLabel>
//               <FormControl>
//                 <Input placeholder="shadcn" {...field} className="input-class focus-visible:ring-orange-1" placeholder="Podcast" {...field} />
//               </FormControl>
//               {/* <FormDescription>
//                 This is your public display name.
//               </FormDescription> */}
//               <FormMessage className="text-white-1"/>
//             </FormItem>
//           )}
//         />
//         <div className="flex flex-col gap-2.5">
//           <Label className="text-16 font-bold text-white-1">
//             Select AI Voice
//           </Label>
//           <Select onValueChange={(value) => setVoiceType(value)}>
//   <SelectTrigger className={cn('text-16 w-full border-none bg-black-1 text-gray-1 text-gray-1')}>
//     <SelectValue placeholder="Select AI Voice" className="placeholder:text-gray-1" />
//   </SelectTrigger>
//   <SelectContent className="text-16 border-none bg-black-1 font-bold text-white-1 focus:ring-orange-1">
//     {voiceCategories.map((voice) => (
//       <SelectItem key={voice} value={voice} className="capitalize focus:bg-orange-1">
//         {voice}
//       </SelectItem>
//     ))}
  
//   </SelectContent>
//   {voiceType && (
//     <audio
//     src={`/${voiceType}.mp3`}
//     autoPlay
//     className="hidden"/>
//     )}
// </Select>
//         </div>

//         <FormField
//           control={form.control}
//           name="podcastDescription"
//           render={({ field }) => (
//             <FormItem className="flex flex-col gap-2.5">
//               <FormLabel className="text-white-1">Username</FormLabel>
//               <FormControl>
//                 <Input placeholder="shadcn" {...field} className="input-class focus-visible:ring-orange-1" placeholder="Podcast" {...field} />
//               </FormControl>
//               {/* <FormDescription>
//                 This is your public display name.
//               </FormDescription> */}
//               <FormMessage className="text-white-1"/>
//             </FormItem>
//           )}
//         />
//         </div>
      
//         <Button type="submit">Submit</Button>
//       </form>
//     </Form>
//     </section>

//   )
// }


// export default CreatePodcast;


 