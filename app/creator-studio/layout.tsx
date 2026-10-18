import type {Metadata} from "next";
import {CreatorStudioShell} from "@/components/CreatorStudioShell";
import "@/styles/creator-studio-sections.css";
export const metadata:Metadata={title:"Creator Studio",robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <CreatorStudioShell>{children}</CreatorStudioShell>}
