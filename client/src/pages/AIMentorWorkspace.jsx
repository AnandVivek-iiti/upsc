// pages/AIMentorWorkspace.jsx

import AIMentorChat from "./AI/AIMentorChat";

export default function AIMentorWorkspace({
  isLoggedIn,
  prefill,
  onClearPrefill,
}) {
  return (
    <div className="w-full h-[100dvh] overflow-hidden">
      <AIMentorChat
        isLoggedIn={isLoggedIn}
        compact={false}
        prefill={prefill}
        onClearPrefill={onClearPrefill}
      />
    </div>
  );
}
