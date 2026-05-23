export interface MemberAccount {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface MemberRegistrationPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface MemberLoginPayload {
  email: string;
  password: string;
}

export interface MemberActivity {
  id: string;
  memberEmail: string;
  memberName: string;
  action: string;
  details: string;
  createdAt: string;
}