import { For, type Component, Show, createSignal, onCleanup } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import Dismiss from "solid-dismiss";
import logo from "../logos/junimo-tippy.png";

// MOBILE
interface NavbarMobileProps {
	items: {
		group: "dropdown" | "profile";
		label: string;
		path: string;
		icon: string;
	}[];
}

const NavbarMobile: Component<NavbarMobileProps> = (
	props: NavbarMobileProps,
) => {
	const [isSelected, setIsSelected] = createSignal<boolean>(false);
	const [isOpen, setIsOpen] = createSignal<boolean>(false);
	let dropdown;

	return (
		<>
			<div
				id='profile'
				class='text-white text-md font-semibold flex items-center gap-1.5 cursor-default'
				//@ts-ignore
				// use:clickOutside={() => {
				// 	setIsSelected(false);
				// }}
			>
				<img
					id='avatarButton'
					class='w-4.5 h-5.5'
					draggable='false'
					// data-dropdown-toggle='userDropdown'
					// data-dropdown-placement='bottom-start'
					src={logo}
					// onClick={() => {
					// 	setIsSelected(!isSelected());
					// }}
				></img>
				tippy
				{/* <div
					id='profile-dropdown'
					class='absolute left-0 top-10 w-full p-2'
				>
					<div
						class={`bg-black flex flex-col mt-2 gap-2 rounded-md min-w-max w-full overflow-hidden ${isSelected() ? "border border-border-gray max-h-96 p-2" : "max-h-0 p-0"
							}`}
					>
						<For each={props.items}>
							{(item) => (
								<Show when={item.group == "profile"}>
									<div class='text-sm flex items-center gap-3 hover:bg-input-gray p-2 rounded-md transition-all'>
										<img src={item.icon} />
										<A href={item.path}>{item.label}</A>
									</div>
								</Show>
							)}
						</For>
					</div>
				</div> */}
			</div>
			<div id='dropdown'>
				<svg
					id='dropdown-icon'
					ref={dropdown}
					class='cursor-pointer h-9 w-9 p-1.5 border border-border-gray rounded-md hover:bg-input-gray'
					fill='white'
					stroke-width='0'
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 512 512'
					style='overflow: visible; color: white;'
				>
					<path d='M64 384h384v-42.67H64Zm0-106.67h384v-42.66H64ZM64 128v42.67h384V128Z'></path>
				</svg>
				<Dismiss
					open={isOpen}
					setOpen={setIsOpen}
					menuButton={dropdown}
				>
					<div
						id='dropdown-items'
						class='absolute right-0 top-10 w-full p-2'
					>
						<div
							class={`bg-black flex flex-col mt-3.5 gap-2 rounded-md min-w-max w-full overflow-hidden ${
								isOpen() ? "border border-border-gray p-2" : "max-h-0 p-0"
							}`}
						>
							<For each={props.items}>
								{(item) => (
									<Show when={item.group == "dropdown"}>
										<a href={item.path}>
											<div class='text-sm flex items-center gap-3 hover:bg-input-gray p-2.5 rounded transition-all'>
												<img
													src={item.icon}
													draggable='false'
												/>
												{item.label}
											</div>
										</a>
									</Show>
								)}
							</For>
							<div class='flex items-center'>
								<div class='flex-grow border-t border-border-gray'></div>
							</div>
							<For each={props.items}>
								{(item) => (
									<Show when={item.group == "profile"}>
										<A href={item.path}>
											<div class='text-sm flex items-center gap-3 hover:bg-input-gray p-2.5 rounded transition-all'>
												<img
													src={item.icon}
													draggable='false'
												/>
												{item.label}
											</div>
										</A>
									</Show>
								)}
							</For>
						</div>
					</div>
				</Dismiss>
			</div>
		</>
	);
};

// MAIN PARENT COMPONENT
interface NavbarProps {
	items: {
		group: "dropdown" | "profile";
		label: string;
		path: string;
		icon: string;
	}[];
}

const Navbar: Component<NavbarProps> = (props: NavbarProps) => {
	//pulls one of each group names
	return (
		<nav class='navbar-container'>
			<div class='border-b border-border-gray bg-black fixed md:hidden flex w-full items-center justify-between px-4 py-2'>
				<NavbarMobile items={props.items} />
			</div>
		</nav>
	);
};

export default Navbar;
