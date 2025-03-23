import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Slash } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-iplastic";
import { Toaster, toast } from "sonner";

// configMap
const ShowConfiguration = () => {
  const [config, setConfig] = useState("");

  useEffect(() => {
    // function to fetch subnets from the backend
    const getSubnets = async () => {
      try {
        const response = await axios.get("http://localhost:8080/configMap");
        setConfig(JSON.stringify(response.data, null, 2));
        console.log(response.data);
        toast.success("Configuration fetched successfully");
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(error.response);
        } else {
          console.error("Unexpected error:", error);
        }
        toast.error("Failed to fetch configuration");
      }
    };
    getSubnets();
  }, []);

  return (
    <>
      <Toaster richColors position="top-right" expand={true} />
      <div className="flex flex-col gap-5 p-10 w-screen h-screen">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="font-semibold text-base">
              Configuration
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem className="font-semibold text-base">
              Show Configuration
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <p className="font-bold text-xl">Show Configuration</p>
          <p className="text-gray-500">
            Current configuration present in cluster's config map.
          </p>
        </div>
        <Separator />
        <AceEditor
          width="auto"
          height="100vh"
          value={config}
          mode="json"
          // editorProps={{ $blockScrolling: true }}
          fontSize={16}
          showPrintMargin
          showGutter
          highlightActiveLine
          theme="iplastic"
          readOnly={true}
          placeholder="N/A"
          setOptions={{ useWorker: false }}
        />
      </div>
    </>
  );
};

export default ShowConfiguration;
