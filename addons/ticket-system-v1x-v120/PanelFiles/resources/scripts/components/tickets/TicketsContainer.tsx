import React, { useEffect } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import useSWR from 'swr';
import tickets from '@/api/tickets/tickets';
import Spinner from '@/components/elements/Spinner';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Formik, Form, FormikHelpers, Field as FormikField } from 'formik';
import { object, string } from 'yup';
import tw from 'twin.macro';
import Field from '@/components/elements/Field';
import Button from '@/components/elements/Button';
import Label from '@/components/elements/Label';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import Select from '@/components/elements/Select';
import { Textarea } from '@/components/elements/Input';
import createTicket from '@/api/tickets/createTicket';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import { NavLink } from 'react-router-dom';

const Code = styled.code`${tw`font-mono py-1 px-2 bg-neutral-900 rounded text-sm inline-block`}`;

export interface TicketsResponse {
    tickets: any[];
    categories: any[];
    statuses: any[];
    priorities: any[];
    servers: any[];
}

interface CreateForm {
    category: number;
    priority: number;
    message: string;
    subject: string;
    relatedServer: number;
}

export default () => {
    const { clearAndAddHttpError, clearFlashes, addFlash } = useFlash();
    const { data, error, mutate } = useSWR<TicketsResponse>([ '/tickets' ], () => tickets());

    const onSubmit = ({ category, priority, message, relatedServer, subject }: CreateForm, { setSubmitting, resetForm }: FormikHelpers<CreateForm>) => {
        clearFlashes('tickets');

        createTicket(category, priority, message, subject, relatedServer).then(() => {
            setSubmitting(false);
            resetForm();
            mutate();
            addFlash({ key: 'tickets', message: 'You\'ve successfully created the a new ticket.', title: 'success', type: 'success' });
        }).catch((error) => {
            setSubmitting(false);
            clearAndAddHttpError({ key: 'tickets', error });
        });
    };

    useEffect(() => {
        if (!error) {
            clearFlashes('tickets');
        } else {
            clearAndAddHttpError({ key: 'tickets', error });
        }
    }, [ error ]);

    return (
        <PageContentBlock title={'Tickets'} showFlashKey={'tickets'}>
            {data ?
                <>
                    <TitledGreyBox title={'New Ticket'}>
                        <Formik
                            onSubmit={onSubmit}
                            initialValues={{
                                category: data.categories[0].id,
                                priority: 0,
                                subject: '',
                                message: '',
                                relatedServer: 0,
                            }}
                            validationSchema={object().shape({
                                subject: string().required('Subject is required').max(50),
                                message: string().required('Message is required'),
                            })}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <div css={tw`flex flex-wrap`}>
                                        <div css={tw`mb-4 w-full lg:w-1/2`}>
                                            <Field
                                                name={'subject'}
                                                label={'Subject'}
                                            />
                                        </div>
                                        <div css={tw`mb-4 w-full lg:w-2/12 lg:pl-4`}>
                                            <Label>Category</Label>
                                            <FormikFieldWrapper name={'category'}>
                                                <FormikField as={Select} name={'category'}>
                                                    {data.categories.map((item, key) => (
                                                        <option key={key} value={item.id}>{item.name}</option>
                                                    ))}
                                                </FormikField>
                                            </FormikFieldWrapper>
                                        </div>
                                        <div css={tw`mb-4 w-full lg:w-2/12 lg:pl-4`}>
                                            <Label>Priority</Label>
                                            <FormikFieldWrapper name={'priority'}>
                                                <FormikField as={Select} name={'priority'}>
                                                    {data.priorities.map((item, key) => (
                                                        <option key={key} value={key}>{item.name}</option>
                                                    ))}
                                                </FormikField>
                                            </FormikFieldWrapper>
                                        </div>
                                        <div css={tw`mb-4 w-full lg:w-2/12 lg:pl-4`}>
                                            <Label>Related Server</Label>
                                            <FormikFieldWrapper name={'relatedServer'}>
                                                <FormikField as={Select} name={'relatedServer'}>
                                                    <option value={0}>- None -</option>
                                                    {data.servers.map((item, key) => (
                                                        <option key={key} value={item.id}>{item.name}</option>
                                                    ))}
                                                </FormikField>
                                            </FormikFieldWrapper>
                                        </div>
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
                    {data.tickets.length < 1 ?
                        <p css={tw`text-center text-sm text-neutral-400 pt-4 pb-4`}>
                            There are no tickets.
                        </p>
                        :
                        (data.tickets.map((item) => (
                            <NavLink to={`/tickets/${item.id}`} key={`ticket-${item.id}`}>
                                <GreyRowBox $hoverable css={tw`flex-wrap md:flex-nowrap mt-2`}>
                                    <div css={tw`flex items-center w-full md:w-auto`}>
                                        <div css={tw`pl-4 pr-6 text-neutral-400`}>
                                            <FontAwesomeIcon icon={faComment} />
                                        </div>
                                        <div css={tw`flex-1 md:w-48 mr-4 overflow-hidden`}>
                                            <Code>{item.subject}</Code>
                                            <Label>Subject</Label>
                                        </div>
                                        <div css={tw`flex-1 md:w-80 mr-4`}>
                                            <Code css={item.status_id === 0 ? tw`bg-primary-300 text-white` : (item.status_id === 1 ? tw`bg-yellow-500 text-white` : tw`bg-red-500 text-white`)}>{data.statuses[item.status_id].name}</Code>
                                            <Label>Status</Label>
                                        </div>
                                        <div css={tw`flex-1 md:w-32 mr-4`}>
                                            <Code>{item.category}</Code>
                                            <Label>Category</Label>
                                        </div>
                                        <div css={tw`flex-1 md:w-16 mr-4`}>
                                            <Code css={item.priority_id === 0 ? tw`bg-primary-500 text-white` : (item.priority_id === 1 ? tw`bg-yellow-500 text-white` : tw`bg-red-500 text-white`)}>{data.priorities[item.priority_id].name}</Code>
                                            <Label>Priority</Label>
                                        </div>
                                        <div css={tw`flex-1 md:w-72 mr-4`}>
                                            <Code>{item.updated_at}</Code>
                                            <Label>Updated At</Label>
                                        </div>
                                    </div>
                                </GreyRowBox>
                            </NavLink>
                        )))
                    }
                </>
                :
                <Spinner size={'large'} centered />
            }
        </PageContentBlock>
    );
};
