export interface Employee {
  id: string;
  name: string;
  email: string;
  role: "Attendant" | "Supervisor" | "Manager";
  lotName: string;
  status: "active" | "invited" | "suspended";
  avatarColor: string;
  joinedAt: string;
}

export const EMPLOYEES: Employee[] = [
  {
    id: "emp_1",
    name: "Diego Marin",
    email: "diego.marin@urbanpark.io",
    role: "Manager",
    lotName: "Marina Bay SmartDeck",
    status: "active",
    avatarColor: "#2a78d6",
    joinedAt: "2024-02-10",
  },
  {
    id: "emp_2",
    name: "Hannah Osei",
    email: "hannah.osei@urbanpark.io",
    role: "Supervisor",
    lotName: "Union Square Central",
    status: "active",
    avatarColor: "#1baf7a",
    joinedAt: "2024-05-22",
  },
  {
    id: "emp_3",
    name: "Tomas Vidal",
    email: "tomas.vidal@urbanpark.io",
    role: "Attendant",
    lotName: "Marina Bay SmartDeck",
    status: "active",
    avatarColor: "#eda100",
    joinedAt: "2025-01-14",
  },
  {
    id: "emp_4",
    name: "Grace Lin",
    email: "grace.lin@urbanpark.io",
    role: "Attendant",
    lotName: "Embarcadero Pier 3",
    status: "invited",
    avatarColor: "#e87ba4",
    joinedAt: "2026-06-30",
  },
  {
    id: "emp_5",
    name: "Samuel Boateng",
    email: "samuel.b@urbanpark.io",
    role: "Attendant",
    lotName: "Union Square Central",
    status: "suspended",
    avatarColor: "#e34948",
    joinedAt: "2023-11-03",
  },
];
