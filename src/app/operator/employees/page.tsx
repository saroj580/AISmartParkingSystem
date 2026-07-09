"use client";

import { useState } from "react";
import { Plus, MoreVertical } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EMPLOYEES } from "@/data/employees";
import { operatorLots } from "@/data/lots";
import { CURRENT_OPERATOR } from "@/data/user";
import { initials } from "@/lib/format";
import { toast } from "sonner";

const STATUS_VARIANT = {
  active: "available",
  invited: "brand",
  suspended: "full",
} as const;

export default function EmployeesPage() {
  const [open, setOpen] = useState(false);
  const lots = operatorLots(CURRENT_OPERATOR.id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Employees"
        description={`${EMPLOYEES.length} staff members across your lots`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="size-4" />Invite employee</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite an employee</DialogTitle>
                <DialogDescription>
                  They’ll receive an email to set up their attendant account.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Full name</Label>
                  <Input placeholder="Jordan Smith" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Email</Label>
                  <Input type="email" placeholder="jordan@urbanpark.io" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Role</Label>
                    <Select defaultValue="Attendant">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Attendant">Attendant</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Assigned lot</Label>
                    <Select defaultValue={lots[0]?.id}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {lots.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); toast.success("Invitation sent"); }}>
                  Send invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Assigned lot</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {EMPLOYEES.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback
                      className="text-[11px]"
                      style={{ backgroundColor: `${e.avatarColor}22`, color: e.avatarColor }}
                    >
                      {initials(e.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{e.role}</TableCell>
              <TableCell className="text-muted-foreground">{e.lotName}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(e.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[e.status]} dot size="sm">
                  {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                    <MoreVertical className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit role</DropdownMenuItem>
                    <DropdownMenuItem>Reassign lot</DropdownMenuItem>
                    <DropdownMenuItem className="text-full focus:bg-full-subtle focus:text-full">
                      Suspend access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
