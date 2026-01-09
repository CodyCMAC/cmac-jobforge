import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Send, MoreHorizontal, Pencil, Trash2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobComments, useCreateComment, useUpdateComment, useDeleteComment, JobComment } from "@/hooks/useJobComments";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface JobCommentsSectionProps {
  jobId: string;
}

export function JobCommentsSection({ jobId }: JobCommentsSectionProps) {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useJobComments(jobId);
  const createComment = useCreateComment(jobId);
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    await createComment.mutateAsync({ body: newComment.trim() });
    setNewComment("");
    toast.success("Comment added");
  };

  const handleUpdate = async (commentId: string) => {
    if (!editingBody.trim()) return;
    
    await updateComment.mutateAsync({ commentId, body: editingBody.trim() });
    setEditingId(null);
    setEditingBody("");
    toast.success("Comment updated");
  };

  const handleDelete = async (comment: JobComment) => {
    await deleteComment.mutateAsync({ commentId: comment.id, jobId: comment.jobId });
    toast.success("Comment deleted");
  };

  const handleCopyLink = (commentId: string) => {
    const url = `${window.location.origin}/jobs/${jobId}#comment-${commentId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(commentId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Link copied to clipboard");
  };

  const canEdit = (comment: JobComment) => {
    if (!user) return false;
    if (comment.authorUserId !== user.id) return false;
    // Can only edit within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return comment.createdAt > fiveMinutesAgo;
  };

  const canDelete = (comment: JobComment) => {
    if (!user) return false;
    return comment.authorUserId === user.id;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Composer */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                ⌘+Enter to send
              </span>
              <Button 
                size="sm" 
                onClick={handleSubmit}
                disabled={!newComment.trim() || createComment.isPending}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              id={`comment-${comment.id}`}
              className="bg-card border border-border rounded-lg p-4 group"
            >
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-muted">
                    {comment.authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                      {comment.updatedAt > comment.createdAt && (
                        <span className="text-xs text-muted-foreground">(edited)</span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyLink(comment.id)}>
                          {copiedId === comment.id ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          Copy link
                        </DropdownMenuItem>
                        {canEdit(comment) && (
                          <DropdownMenuItem 
                            onClick={() => {
                              setEditingId(comment.id);
                              setEditingBody(comment.body);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete(comment) && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(comment)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {editingId === comment.id ? (
                    <div className="mt-2">
                      <Textarea
                        value={editingBody}
                        onChange={(e) => setEditingBody(e.target.value)}
                        className="min-h-[60px] resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdate(comment.id)}
                          disabled={updateComment.isPending}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setEditingId(null);
                            setEditingBody("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                      {comment.body}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
