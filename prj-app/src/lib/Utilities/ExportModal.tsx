import { Component, JSX } from "solid-js";
import { Portal } from "solid-js/web";

interface ModalProps {
    header: string;
    body: JSX.Element;
    denyButton: JSX.Element;
    confirmButton: JSX.Element;
}

const ExportModal: Component<ModalProps> = (props) => {
    const { header, body, denyButton, confirmButton} = props;

    return (
        <>
            <Portal>
                <div class='fixed top-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 z-[999]'>
                    <div class='flex justify-center'>
                        <div class='w-[23rem] bg-black'>
                            <div class='border border-border-gray rounded-md'>
                                <div class='flex px-6 pt-6 font-semibold'>
                                    {header}
                                </div>
                                <div class='flex justify-center pt-1 pb-6 px-6 text-table-header-gray text-sm font-medium'>
                                    {body}
                                </div>
                                <div class='px-6 flex flex-col'>
                                    <div class='flex justify-center pb-2 text-sm'>
                                        {confirmButton}                                     
                                    </div>
                                    <div class='flex justify-center pb-6 text-sm'>
                                        {denyButton}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Portal>
        </>
    )

}

export default ExportModal;