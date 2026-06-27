import React, { useContext, useMemo } from "react";
import { GrievanceContext } from "../../context/GrievanceContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import { getCategoryIcon } from "../../utils/categoryMeta";

const ChatroomsView = ({ onSelectCase }) => {
  const { cases, assignments, comments, getPersonName } = useContext(GrievanceContext);
  const { authUser } = useAuth();
  const officialId = authUser?.OfficialID || authUser?.UserID;

  // Filter cases assigned to this advocate
  const myCases = useMemo(() => {
    const myAssignments = assignments.filter((a) => Number(a.AssignedToUserID) === Number(officialId));
    return myAssignments
      .map((a) => cases.find((c) => c.CaseID === a.CaseID))
      .filter(Boolean);
  }, [assignments, cases, officialId]);

  // Map each case to its last message/comment details
  const chatThreads = useMemo(() => {
    return myCases.map((c) => {
      const caseComments = comments.filter((comm) => comm.CaseID === c.CaseID);
      const lastComment = caseComments.length > 0
        ? caseComments.sort((a, b) => b.CommentID - a.CommentID)[0]
        : null;

      return {
        c,
        lastComment,
        lastMessageText: lastComment ? lastComment.CommentText : "No messages exchanged yet.",
        lastMessageTime: lastComment ? lastComment.CreatedDate : c.CreatedDate,
        lastSenderName: lastComment ? getPersonName(lastComment.UserID) : "System"
      };
    }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
  }, [myCases, comments, getPersonName]);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Title Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 m-0">Case Messages</h2>
        <p className="text-xs text-slate-500 mt-1">
          Direct messaging channels with employees regarding their active cases.
        </p>
      </div>

      {/* Threads list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {chatThreads.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <span className="text-4xl">💬</span>
            <div>
              <div className="text-xs font-bold text-slate-800 mb-1">No active chats</div>
              <p className="text-[11px] text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                Once cases are assigned to your profile, separate messaging rooms will automatically load here.
              </p>
            </div>
          </div>
        ) : (
          chatThreads.map(({ c, lastComment, lastMessageText, lastMessageTime, lastSenderName }) => (
            <div
              key={c.CaseID}
              onClick={() => onSelectCase(c)}
              className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition-colors duration-150"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0 mt-0.5">
                  <Avatar name={getPersonName(c.UserID)} size={36} />
                  <span className="absolute -bottom-1 -right-1 text-base bg-white rounded-full p-0.5 border border-slate-200">
                    {getCategoryIcon(c.CategoryID)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-xs font-bold text-slate-800 m-0 truncate pr-4">
                      #{c.CaseID} · {c.Subject}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0">
                      {lastMessageTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate pr-8">
                    <strong>{lastSenderName}:</strong> {lastMessageText}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-slate-400 text-xs font-semibold pl-2">
                Reply →
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatroomsView;
