// import { AppSidebar } from "@/components/AppSidebar";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";

// export default function Page() {
//   return (
//     <SidebarProvider>
//       <AppSidebar />
//       <SidebarInset>
//         <header className="group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 flex items-center gap-2 h-16 transition-[width,height] ease-linear shrink-0">
//           <div className="flex items-center gap-2 px-4">
//             <SidebarTrigger className="-ml-1" />
//             <Separator orientation="vertical" className="mr-2 h-4" />
//             <Breadcrumb>
//               <BreadcrumbList>
//                 <BreadcrumbItem className="md:block hidden">
//                   <BreadcrumbLink href="#">
//                     Building Your Application
//                   </BreadcrumbLink>
//                 </BreadcrumbItem>
//                 <BreadcrumbSeparator className="md:block hidden" />
//                 <BreadcrumbItem>
//                   <BreadcrumbPage>Data Fetching</BreadcrumbPage>
//                 </BreadcrumbItem>
//               </BreadcrumbList>
//             </Breadcrumb>
//           </div>
//         </header>
//         <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
//           <div className="gap-4 grid md:grid-cols-3 auto-rows-min">
//             <div className="bg-muted/50 rounded-xl aspect-video" />
//             <div className="bg-muted/50 rounded-xl aspect-video" />
//             <div className="bg-muted/50 rounded-xl aspect-video" />
//           </div>
//           <div className="flex-1 bg-muted/50 rounded-xl min-h-[100vh] md:min-h-min" />
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }
