import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
// hooks imports
import { useEffect, useState } from "react";
// external libraries imports
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Separator } from "@/components/ui/separator";
// types imports
import { PodItem } from "@/types";

// Helper function to calculate age
const calculateAge = (startTime: string): string => {
  const now = new Date();
  const past = new Date(startTime);
  const diffInMs = now.getTime() - past.getTime();

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}, ${hours % 24} hour${
      hours % 24 !== 1 ? "s" : ""
    } `;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}, ${minutes % 60} minute${
      minutes % 60 !== 1 ? "s" : ""
    }`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else {
    return `${seconds} second${seconds !== 1 ? "s" : ""} `;
  }
};

// Dashboard component
const Dashboard = () => {
  // usestate to store pods
  const [pods, setPods] = useState<{ items: PodItem[] } | null>(null);

  useEffect(() => {
    // fetch pods from the api
    const getPods = async () => {
      try {
        const response = await axios.get("http://localhost:8080/pods");
        setPods(response.data.pods);
        console.log(response.data.pods);
        if (response.data.pods.items == null) {
          toast.warning("No pods found with label");
        } else {
          toast.success("Pods fetched successfully");
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(error.response);
        } else {
          console.error("Unexpected error:", error);
        }
        toast.error("Failed to fetch pods");
      }
    };
    getPods();
  }, []);

  return (
    <>
      <Toaster richColors position="top-right" expand={true} />
      <div className="flex flex-col gap-5 p-10 w-screen">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="font-semibold text-base">
              Dashboard
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <p className="font-bold text-xl">Running Pods</p>
          <p className="text-gray-500">
            Pods that are currently running in the cluster with configured
            labels.
          </p>
        </div>
        <Separator />
        <Table className="bg-gray-30 overflow-hidden">
          <TableHeader className="bg-gray-100 border-b">
            <TableRow>
              <TableHead className="px-6 py-4 font-semibold text-gray-800 text-sm">
                Pod Name
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-gray-800 text-sm">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-gray-800 text-sm">
                IP
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-gray-800 text-sm">
                Label
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-gray-800 text-sm">
                Age
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-gray-800 text-sm">
                Node
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-gray-800 text-sm">
                Restarts
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="border-b divide-y divide-gray-200">
            {pods?.items == null && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-6 py-4 text-gray-600 text-sm"
                >
                  No pods found with this label.
                </TableCell>
              </TableRow>
            )}
            {pods?.items?.map((pod) => (
              <TableRow
                key={pod.metadata.name}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="px-6 py-4 font-medium text-gray-900 text-sm">
                  {pod.metadata.name}
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-600 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${
                    pod.status.phase.toLowerCase() === "running"
                      ? "bg-green-100 text-green-800"
                      : pod.status.phase.toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                  >
                    {pod.status.phase}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-600 text-sm">
                  {pod.status.podIP}
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-600 text-sm">
                  <span className="bg-blue-100 px-3 py-1 rounded-full font-medium text-blue-800 text-xs">
                    {pod.metadata.labels.app}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 font-medium text-gray-900 text-sm">
                  {pod.status.startTime
                    ? calculateAge(pod.status.startTime)
                    : "N/A"}
                </TableCell>
                <TableCell className="px-6 py-4 font-medium text-gray-900 text-sm">
                  {pod.spec.nodeName}
                </TableCell>
                <TableCell className="px-6 py-4 font-medium text-gray-900 text-sm">
                  {pod.status.containerStatuses.map((container) =>
                    container.name == "kea-dhcp4"
                      ? container.restartCount
                      : null,
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default Dashboard;
