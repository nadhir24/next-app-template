import { title } from "@/components/primitives";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export default function EditPage() {
  return (
    <>
      <div>
        <h1 className={title()}>Edit</h1>
        <Card className="">
          <CardContent>$1000</CardContent>
        </Card>
      </div>
      <div>
        <h1 className={title()}>Edit</h1>
        <Card className="">
          <CardContent>$1000</CardContent>
        </Card>
      </div>
      <div>
        <h1 className={title()}>Edit</h1>
        <Card className="">
          <CardContent>$1000</CardContent>
        </Card>
      </div>
      <div>
        <h1 className={title()}>Edit</h1>
        <Card className="">
          <CardContent>$1000</CardContent>
        </Card>
      </div>
    </>
  );
}
