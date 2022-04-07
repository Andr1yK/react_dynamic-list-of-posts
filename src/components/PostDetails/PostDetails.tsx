/* eslint-disable no-console */
import {
  FC, memo, useCallback, useEffect, useState,
} from 'react';
import { deleteComment, getPostComments } from '../../api/comments';
import { getPostDetails } from '../../api/posts';
import { useToggle } from '../../hooks/useToggle';
import { Comment, CreateComment } from '../../types/comment';
import { IPostDetails } from '../../types/PostDetails';
import { NewCommentForm } from '../NewCommentForm';
import './PostDetails.scss';

type Props = {
  postId: number;
};

export const PostDetails: FC<Props> = memo(({ postId }) => {
  const [details, setDetails] = useState<IPostDetails | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCommentsVisible, toggleCommentsVisible] = useToggle(true);

  const onCreateComment = useCallback((body: CreateComment) => {
    const newComment: Comment = {
      ...body,
      id: +new Date(),
    };

    setComments((state) => [...state, newComment]);
  }, []);

  useEffect(() => {
    setDetails(null);
    setComments([]);

    const fetchDetails = async (id: number) => {
      const data: IPostDetails = await getPostDetails(id);

      setDetails(data);

      return data;
    };

    const fetchComments = async (id: number) => {
      const data: Comment[] = await getPostComments(id);

      setComments(data);

      return data;
    };

    Promise.all([fetchDetails(postId), fetchComments(postId)]).catch(console.warn);
  }, [postId]);

  const removeComment = useCallback((commentId: number) => () => {
    deleteComment(commentId);
    setComments((state) => state.filter(({ id }) => id !== commentId));
  }, [postId]);

  return (
    <div className="PostDetails">
      <h2>Post details:</h2>

      {details !== null
        ? (
          <>
            <section className="PostDetails__post">
              <p>{details.body}</p>
            </section>

            <section className="PostDetails__comments">
              {!!comments.length && (
                <button
                  type="button"
                  className="button"
                  onClick={toggleCommentsVisible}
                >
                  {`${isCommentsVisible ? 'Hide' : 'Show'} ${comments.length} comments`}
                </button>
              )}

              <ul className="PostDetails__list">
                {isCommentsVisible && comments.map(({ body, id }) => (
                  <li key={id} className="PostDetails__list-item">
                    <button
                      type="button"
                      className="PostDetails__remove-button button"
                      onClick={removeComment(id)}
                    >
                      X
                    </button>
                    <p>{body}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="PostDetails__form-wrapper">
                <NewCommentForm postId={postId} onCreate={onCreateComment} />
              </div>
            </section>
          </>
        ) : (
          <p>Loading...</p>
        )}
    </div>
  );
});
