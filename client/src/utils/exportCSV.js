export const downloadFeedbackCSV = (feedbackList) => {
  if (!feedbackList?.length) return;
  const headers = ["ID", "User", "Email", "Rating", "Feature", "Feedback", "Recommend", "Date"];
  const rows = feedbackList.map((fb) => [
    fb.id,
    fb.User?.name || "Anonymous",
    fb.User?.email || "",
    fb.rating || "",
    fb.feature,
    fb.feedbackText?.replace(/\n/g, " ") || "",
    fb.wouldRecommend ? "Yes" : fb.wouldRecommend === false ? "No" : "",
    new Date(fb.createdAt).toISOString(),
  ]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `feedback_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
};