// components imports
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// external libraries imports
import { toast, Toaster } from "sonner";
import axios from "axios";
import { Slash } from "lucide-react";

// showsubnet component
const AddSubnetToExsisting = () => {
  // function to add subnet
  const addSubnet = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const subnetValue = (document.getElementById("subnet") as HTMLInputElement)
      .value;
    const poolStartValue = (
      document.getElementById("pool-start") as HTMLInputElement
    ).value;
    const poolEndValue = (
      document.getElementById("pool-end") as HTMLInputElement
    ).value;
    const routerValue = (document.getElementById("router") as HTMLInputElement)
      .value;
    const dnsValue = (document.getElementById("dns") as HTMLInputElement).value;

    try {
      await axios.post("http://localhost:8080/subnets", {
        subnet: subnetValue,
        pools: [
          {
            pool: `${poolStartValue} - ${poolEndValue}`,
          },
        ],
        "option-data": [
          {
            name: "router",
            data: routerValue,
          },
          {
            name: "dns",
            data: dnsValue,
          },
        ],
      });
      (document.getElementById("subnet") as HTMLInputElement).value = "";
      (document.getElementById("pool-start") as HTMLInputElement).value = "";
      (document.getElementById("pool-end") as HTMLInputElement).value = "";
      (document.getElementById("router") as HTMLInputElement).value = "";
      (document.getElementById("dns") as HTMLInputElement).value = "";
      toast.success("Subnet added successfully");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response);
      } else {
        console.error("Unexpected error:", error);
      }
      toast.error("Failed to add subnet");
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" expand={true} />
      <div className="flex flex-col gap-5 p-10 w-screen">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="font-semibold text-base">
              Subnets
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem className="font-semibold text-base">
              Add Subnets to Existing
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <p className="font-bold text-xl">Add Subnets</p>
          <p className="text-gray-500">
            Subnets will be added to exsisting Kea configuration.
          </p>
        </div>
        <Separator />
        <form className="flex flex-col space-y-5 w-1/2" onSubmit={addSubnet}>
          <div className="flex flex-col space-y-2">
            <Label className="font-semibold">Subnet CIDR</Label>
            <Input placeholder="11.0.0.0/9" required={true} id="subnet" />
          </div>
          <div className="flex flex-col space-y-2">
            <Label className="font-semibold">Pool Start</Label>
            <Input placeholder="11.0.0.2" required={true} id="pool-start" />
          </div>
          <div className="flex flex-col space-y-2">
            <Label className="font-semibold">Pool End</Label>
            <Input placeholder="11.127.255.254" required={true} id="pool-end" />
          </div>
          <div className="flex flex-col space-y-2">
            <Label className="font-semibold">Router IP</Label>
            <Input placeholder="11.0.0.1" required={true} id="router" />
          </div>
          <div className="flex flex-col space-y-2">
            <Label className="font-semibold">DNS</Label>
            <Input
              placeholder="10.1.6.2,10.254.153.200"
              required={true}
              id="dns"
            />
            <p className="text-gray-500 text-sm">
              Add multiple DNS servers separated by comma.
            </p>
          </div>
          <Button className="w-36" variant="default" type="submit">
            Add Subnet
          </Button>
        </form>
      </div>
    </>
  );
};

export default AddSubnetToExsisting;
