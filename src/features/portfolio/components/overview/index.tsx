import type { User } from "@/features/portfolio/types/user";

import { MarsIcon, NonBinaryIcon, VenusIcon } from "lucide-react";

export function getGenderIcon(gender: User["gender"]) {
  switch (gender) {
    case "male":
      return <MarsIcon />;
    case "female":
      return <VenusIcon />;
    case "non-binary":
      return <NonBinaryIcon />;
  }
}
