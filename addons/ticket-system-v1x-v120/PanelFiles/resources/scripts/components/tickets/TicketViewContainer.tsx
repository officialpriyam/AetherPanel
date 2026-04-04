import React, { useEffect } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import useSWR from 'swr';
import ticket from '@/api/tickets/ticket';
import { useParams } from 'react-router';
import Spinner from '@/components/elements/Spinner';
import tw from 'twin.macro';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { FormikHelpers, Form, Formik, Field as FormikField } from 'formik';
import { object, string } from 'yup';
import Button from '@/components/elements/Button';
import Label from '@/components/elements/Label';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import { Textarea } from '@/components/elements/Input';
import reply from '@/api/tickets/reply';
import styled from 'styled-components/macro';
import { NavLink } from 'react-router-dom';

const Code = styled.code`${tw`font-mono py-1 px-2 bg-neutral-900 rounded text-sm inline-block`}`;

export interface TicketResponse {
    ticket: any;
    messages: any[];
    statuses: any[];
    priorities: any[];
}

interface Reply {
    message: string;
}

export default () => {
    // @ts-ignore
    const { id } = useParams();

    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();
    const { data, error, mutate } = useSWR<TicketResponse>([ id, `/tickets/view/${id}` ], (id) => ticket(id));

    const sendReply = ({ message }: Reply, { setSubmitting, resetForm }: FormikHelpers<Reply>) => {
        clearFlashes('tickets:view');

        reply(data?.ticket.id, message).then(() => {
            setSubmitting(false);
            resetForm();
            mutate();
            addFlash({ key: 'tickets', message: 'You\'ve successfully send the reply.', title: 'success', type: 'success' });
        }).catch((error) => {
            setSubmitting(false);
            clearAndAddHttpError({ key: 'tickets:view', error });
        });
    };

    useEffect(() => {
        if (!error) {
            clearFlashes('tickets:view');
        } else {
            clearAndAddHttpError({ key: 'tickets:view', error });
        }
    }, [ error ]);

    return (
        <PageContentBlock title={'View Ticket'} showFlashKey={'tickets:view'}>
            {data ?
                <div css={tw`flex flex-wrap`}>
                    <div css={tw`w-full lg:w-8/12`}>
                        {data.ticket.status_id !== 2 &&
                            <TitledGreyBox title={'Reply'} css={tw`mb-8`}>
                                <Formik
                                    onSubmit={sendReply}
                                    initialValues={{
                                        message: '',
                                    }}
                                    validationSchema={object().shape({
                                        message: string().required('Message is required').max(2000),
                                    })}
                                >
                                    {({ isSubmitting }) => (
                                        <Form>
                                            <div css={tw`flex flex-wrap`}>
                                                <div css={tw`mb-4 w-full pt-2`}>
                                                    <Label>Message</Label>
                                                    <FormikFieldWrapper name={'message'}>
                                                        <FormikField as={Textarea} name={'message'} />
                                                    </FormikFieldWrapper>
                                                </div>
                                            </div>
                                            <div css={tw`flex justify-end`}>
                                                <Button type={'submit'} disabled={isSubmitting} isLoading={isSubmitting}>Create</Button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </TitledGreyBox>
                        }
                        {data.messages.map((item) => (
                            <div css={tw`rounded shadow-md bg-neutral-700 mt-4`} key={`ticket-${data.ticket.id}-${item.id}`}>
                                <div css={tw`bg-neutral-900 rounded-t p-3 border-b border-black`}>
                                    <p css={tw`float-right`}>
                                        <small>{item.sent_at}</small>
                                    </p>
                                    <p css={tw`text-sm uppercase`}>
                                        {item.firstname} {item.lastname} ({data.ticket.user_id === item.user_id ? 'Client' : 'Admin'})
                                    </p>
                                </div>
                                <div css={tw`p-3`}>
                                    <div dangerouslySetInnerHTML={{ __html: item.message }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div css={tw`w-full lg:w-4/12 lg:pl-4`}>
                        <TitledGreyBox title={'Information'}>
                            <div css={tw`flex flex-wrap`}>
                                <b css={tw`w-full w-4/12 text-right pr-2 pb-1`}>Subject:</b>
                                <span css={tw`w-full w-6/12 pb-1`}>
                                    {data.ticket.subject}
                                </span>

                                <b css={tw`w-full w-4/12 text-right pr-2 pb-1`}>Status:</b>
                                <span css={tw`w-full w-6/12 mb-1`}>
                                    <Code css={data.ticket.status_id === 0 ? tw`bg-primary-300 text-white` : (data.ticket.status_id === 1 ? tw`bg-yellow-500 text-white` : tw`bg-red-500 text-white`)} style={{ fontSize: '0.8rem' }}>{data.statuses[data.ticket.status_id].name}</Code>
                                </span>

                                <b css={tw`w-full w-4/12 text-right pr-2 pb-1`}>Category:</b>
                                <span css={tw`w-full w-6/12 pb-1`}>
                                    {data.ticket.category}
                                </span>

                                <b css={tw`w-full w-4/12 text-right pr-2 pb-1`}>Priority:</b>
                                <span css={tw`w-full w-6/12 mb-1`}>
                                    <Code css={data.ticket.priority_id === 0 ? tw`bg-primary-500 text-white` : (data.ticket.priority_id === 1 ? tw`bg-yellow-500 text-white` : tw`bg-red-500 text-white`)} style={{ fontSize: '0.8rem' }}>{data.priorities[data.ticket.priority_id].name}</Code>
                                </span>

                                <b css={tw`w-full w-4/12 text-right pr-2 pb-1`}>Server:</b>
                                <span css={tw`w-full w-6/12 pb-1`}>
                                    {data.ticket.related_server_id === null ?
                                        <p>No</p>
                                        :
                                        <NavLink to={`/server/${data.ticket.uuidShort}`}>{data.ticket.serverName}</NavLink>
                                    }
                                </span>

                                <b css={tw`w-full w-4/12 text-right pr-2 pb-1`}>Created At:</b>
                                <span css={tw`w-full w-6/12 mb-1`}>
                                    <Code style={{ fontSize: '.8rem' }}>{data.ticket.created_at}</Code>
                                </span>

                                <b css={tw`w-full w-4/12 text-right pr-2 pb-1`}>Updated At:</b>
                                <span css={tw`w-full w-6/12 mb-1`}>
                                    <Code style={{ fontSize: '.8rem' }}>{data.ticket.updated_at}</Code>
                                </span>
                            </div>
                        </TitledGreyBox>
                    </div>
                </div>
                :
                <Spinner size={'large'} centered />
            }
        </PageContentBlock>
    );
};
