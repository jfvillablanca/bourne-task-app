import { Check, PlusCircle, X } from 'lucide-react';
import { CSSProperties, useState } from 'react';
import Select, {
    ActionMeta,
    ClearIndicatorProps,
    MultiValue,
    OnChangeValue,
} from 'react-select';

import { User } from '../common';
import { cn } from '../lib/utils';

import { Dialog, DialogClose, DialogContent, DialogTrigger } from './ui';

type UserOption = {
    label: string;
    value: string;
    _id: string;
    isFixed: boolean;
};

interface FormSelectUsersProps {
    allUsers: (User & { isFixed?: boolean })[];
    selectedUsers: (User & { isFixed?: boolean })[];
    handleChange: (e: MultiValue<UserOption>) => void;
}

const FormSelectUsers = ({
    allUsers,
    selectedUsers,
    handleChange,
}: FormSelectUsersProps) => {
    const [open, setOpen] = useState(false);
    const allUserOptions: UserOption[] = allUsers.map((user) => {
        return {
            label: user.email,
            value: user.email,
            _id: user._id,
            isFixed: !!user.isFixed,
        };
    });

    const selectedUserOptions: UserOption[] = selectedUsers.map((user) => {
        return {
            label: user.email,
            value: user.email,
            _id: user._id,
            isFixed: !!user.isFixed,
        };
    });

    const orderOptions = (options: readonly UserOption[]) => {
        return options
            .filter((user) => user.isFixed)
            .concat(options.filter((user) => !user.isFixed));
    };

    const handleMenuChange = (
        selectedUserOptions: OnChangeValue<UserOption, true>,
        actionMeta: ActionMeta<UserOption>,
    ) => {
        if (actionMeta.action === 'clear') {
            handleChange(
                orderOptions(
                    selectedUserOptions.filter(
                        (option) => option.isFixed !== true,
                    ),
                ),
            );
            return;
        } else if (
            (actionMeta.action === 'pop-value' ||
                actionMeta.action === 'remove-value') &&
            actionMeta.removedValue.isFixed
        ) {
            return;
        }
        handleChange(orderOptions(selectedUserOptions));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="ml-1 p-3 rounded-full border border-dashed border-neutral-content/50 text-neutral-content/50 hover:text-accent-content hover:border-accent-content transition-colors"
                    data-testid={'open-select-update-assigned'}
                    onClick={(e) => {
                        e.preventDefault();
                        setOpen((v) => !v);
                    }}
                >
                    <PlusCircle />
                </button>
            </DialogTrigger>
            <DialogContent
                className="relative z-10 h-max transition"
                overlayClassName="backdrop-blur-[2px]"
            >
                <Select
                    className="max-w-[50rem] w-fit z-10 min-w-[30rem] min-h-[2rem]"
                    data-testid={'select-update-assigned'}
                    autoFocus
                    styles={{
                        multiValueRemove: (base, props) => {
                            return props.data.isFixed
                                ? { ...base, display: 'none' }
                                : base;
                        },
                    }}
                    classNames={{
                        control: () =>
                            cn('bg-base-100 text-neutral-content h-full'),
                        valueContainer: () =>
                            cn(
                                'border border-neutral-content border-r-0 py-3 px-2',
                            ),
                        input: () => cn('m-0.5 py-0.5 text-md font-semibold'),
                        multiValue: ({ data }) => {
                            const baseClassName = cn(
                                'm-1 bg-base-300 rounded-md text-md text-base-content font-semibold',
                            );
                            return data.isFixed
                                ? cn(
                                      baseClassName,
                                      'bg-base-200 border border-neutral-content',
                                  )
                                : baseClassName;
                        },
                        multiValueLabel: ({ data }) => {
                            const baseClassName = cn('py-1 px-2');
                            return data.isFixed
                                ? cn(baseClassName, 'font-bold')
                                : baseClassName;
                        },
                        multiValueRemove: () =>
                            cn(
                                'rounded-r-md px-1 hover:bg-error hover:text-error-content',
                            ),
                        indicatorsContainer: () =>
                            cn(
                                'border border-neutral-content flex w-20 min-w-[4rem]',
                            ),
                        clearIndicator: ({ isFocused }) =>
                            cn(
                                'flex-1 p-2 h-full justify-center place-items-center',
                                isFocused
                                    ? 'text-warning hover:bg-warning hover:text-warning-content'
                                    : '',
                            ),
                        dropdownIndicator: ({ isFocused }) =>
                            cn(
                                'flex-1 p-2 h-full justify-center place-items-center',
                                isFocused
                                    ? 'text-info hover:bg-info hover:text-info-content'
                                    : '',
                            ),
                        menu: () => cn('bg-base-300/90 text-base-content my-1'),
                        menuList: () => cn('py-2'),
                        noOptionsMessage: () =>
                            cn('py-2 px-3 font-semibold uppercase'),
                        option: ({ isFocused }) =>
                            cn(
                                isFocused
                                    ? 'bg-primary text-primary-content font-semibold'
                                    : 'bg-transparent',
                                'py-2 px-3',
                            ),
                        placeholder: () => cn('mx-0.5'),
                    }}
                    value={selectedUserOptions}
                    isClearable={selectedUserOptions.some(
                        (user) => !user.isFixed,
                    )}
                    placeholder={'Select members to assign'}
                    options={allUserOptions}
                    isMulti
                    unstyled
                    onChange={handleMenuChange}
                    closeMenuOnSelect={false}
                    components={{ ClearIndicator }}
                    aria-label="select project members"
                />
                <DialogClose className="absolute -bottom-9 right-0 w-20 min-w-[4rem] pt-2 pb-1 z-0 flex justify-center border border-neutral-content bg-base-100 text-neutral-content hover:bg-success hover:text-success-content">
                    <Check className="mr-1" />
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default FormSelectUsers;

const ClearIndicator = (props: ClearIndicatorProps<UserOption, true>) => {
    const {
        getStyles,
        getClassNames,
        innerProps: { ref, ...restInnerProps },
    } = props;
    return (
        <div
            {...restInnerProps}
            ref={ref}
            style={getStyles('clearIndicator', props) as CSSProperties}
            className={getClassNames('clearIndicator', props)}
            aria-label="clear selected users"
        >
            <X size={'18'} />
        </div>
    );
};
