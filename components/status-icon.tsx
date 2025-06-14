import { ShieldCheck, AlertTriangle, AlertCircle, UserPlus, FileEdit, ShieldAlert } from "lucide-react"

interface StatusIconProps {
  classification: string
}

export function StatusIcon({ classification }: StatusIconProps) {
  switch (classification) {
    case "normal":
      return <ShieldCheck className="h-5 w-5 text-green-500" title="Secure" />

    case "login_failed":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" title="Alert (Caution)" />

    case "system_error":
      return <AlertCircle className="h-5 w-5 text-orange-500" title="Warning" />

    case "user_creation":
      return <UserPlus className="h-5 w-5 text-amber-600" title="Alert (Caution)" />

    case "registry_modification":
      return <FileEdit className="h-5 w-5 text-purple-500" title="Alert" />

    case "privilege_escalation":
      return <ShieldAlert className="h-5 w-5 text-red-600" title="WARNING" />

    default:
      return <AlertCircle className="h-5 w-5 text-gray-400" title="Unknown" />
  }
}
