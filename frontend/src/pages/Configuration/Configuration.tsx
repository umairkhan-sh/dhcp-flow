// components imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
// external libraries
import axios from "axios";
import { Toaster, toast } from "sonner";
// hooks
import { useEffect, useState } from "react";

// configuration component
const Configuration = () => {
  // usestates to store namespace, label and kubeconfig
  const [namespace, setNamespace] = useState("");
  const [label, setLabel] = useState("");
  const [kubeConfig, setKubeConfig] = useState("");

  useEffect(() => {
    // handler functions
    const getConfigOptions = async () => {
      try {
        const response = await axios.get("http://localhost:8080/configOptions");
        setNamespace(response.data.namespace);
        setLabel(response.data.label);
        toast.success("Config options fetched successfully");
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(error.response);
        } else {
          console.error("Unexpected error:", error);
        }
        toast.error("Failed to fetch config opritons");
      }
    };

    const getKubeConfig = async () => {
      try {
        const response = await axios.get("http://localhost:8080/kubeConfig");
        setKubeConfig(response.data.kubeConfig);
        toast.success("Kubeconfig fetched successfully");
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(error.response);
        } else {
          console.error("Unexpected error:", error);
        }
        toast.error("Failed to fetch kubeconfig");
      }
    };
    getConfigOptions();
    getKubeConfig();
  }, []);

  // handler functions
  const updateConfigOption = async () => {
    try {
      const response = await axios.post("http://localhost:8080/configOptions", {
        namespace,
        label,
      });
      setNamespace(response.data.namespace);
      setLabel(response.data.label);
      toast.success("Successfully updated config options");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response);
      } else {
        console.error("Unexpected error:", error);
      }
      toast.error("Failed to update config options");
    }
  };

  const uploadKubeConfig = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const formData = new FormData();
      if (e.target.files && e.target.files.length > 0) {
        formData.append("kubeConfig", e.target.files[0]);
      }
      setKubeConfig("TEMP");
      await axios.post("http://localhost:8080/kubeConfig", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Kubeconfig uploaded successfully");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error);
      } else {
        console.error("Unexpected error:", error);
      }
      toast.error("Failed to upload kubeconfig");
    }
  };

  const deleteKubeConfig = async () => {
    try {
      await axios.delete("http://localhost:8080/kubeConfig");
      setKubeConfig("");
      toast.success("Kubeconfig deleted successfully");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error);
      } else {
        console.error("Unexpected error:", error);
      }
      toast.error("Failed to delete kubeconfig");
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" expand={true} />
      <div className="flex flex-col gap-5 p-10 w-screen">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="font-semibold text-base">
              Settings
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <p className="font-bold text-xl">Settings</p>
          <p className="text-gray-500">Manage your application settings.</p>
        </div>
        <Separator />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateConfigOption();
          }}
          className="flex flex-col space-y-5 w-1/2"
        >
          <div className="flex flex-col space-y-2">
            <Label className="font-semibold">Namespace</Label>
            <Input
              placeholder="default"
              required={true}
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
            />
            <p className="text-gray-500 text-sm">
              This is the namespace will be used throuhout the application.
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Label className="font-semibold">Label</Label>
            <Input
              placeholder="app=kea"
              required={true}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <p className="text-gray-500 text-sm">
              This label will be used throuhout the application.
            </p>
          </div>
          <Button className="w-36" variant="default" type="submit">
            Update
          </Button>
        </form>
        <Separator />
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="flex flex-col space-y-5 w-1/2"
        >
          <div className="flex flex-col space-y-2">
            <Label className="font-semibold">Kubeconfig</Label>
            {!kubeConfig && <Input type="file" onChange={uploadKubeConfig} />}
            <p className="text-gray-500 text-sm">
              Uploaded kubeconfig file will be used to access cluster.
            </p>
          </div>
          {kubeConfig && (
            <Button
              className="bg-red-600 hover:bg-red-600 px-32 w-48 font-bold"
              onClick={deleteKubeConfig}
            >
              Delete Uploaded Kubeconfig
            </Button>
          )}
        </form>
      </div>
    </>
  );
};

export default Configuration;
