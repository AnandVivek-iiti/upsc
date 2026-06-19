// pages/AIMentorWorkspace.jsx

import AIMentorChat from "./AI/AIMentorChat";

export default function AIMentorWorkspace({
  isLoggedIn,
  prefill,
  onClearPrefill,
}) {
  return (
    <div className="h-[calc(100vh-2rem)] p-6">
      <AIMentorChat
        isLoggedIn={isLoggedIn}
        compact={false}
        prefill={prefill}
        onClearPrefill={onClearPrefill}
      />
    </div>
  );
}