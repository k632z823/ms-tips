import { For, type Component, Show, createSignal, onCleanup } from "solid-js";
import { A } from "@solidjs/router";

import pfp from "../logos/cat_profile_pic.png";

function clickOutside(
	el: {
		contains: (arg0: any) => any;
	},
	accessor: () => {
		(): any;
		new (): any;
	},
) {
	const onClick = (e: { target: any }) =>
		!el.contains(e.target) && accessor()?.();

	document.body.addEventListener("click", onClick);

	onCleanup(() => {
		document.body.removeEventListener("click", onClick);
	});
}

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

	return (
		<>
			<div
				id='profile'
				class='text-white text-sm flex items-center gap-2'
				//@ts-ignore
				use:clickOutside={() => {
					setIsSelected(false);
				}}
			>
				<img
					id='avatarButton'
					class='w-5 h-5 rounded-full cursor-pointer'
					data-dropdown-toggle='userDropdown'
					data-dropdown-placement='bottom-start'
					src={pfp}
					onClick={() => {
						setIsSelected(!isSelected());
					}}
				></img>
				Mustard Seed
				<div
					id='profile-dropdown'
					class='absolute left-0 top-10 w-full p-2'
				>
					<div
						class={`bg-black flex flex-col mt-2 gap-2 rounded-md min-w-max w-full overflow-hidden ${
							isSelected() ? "border border-border-gray max-h-96 p-2" : "max-h-0 p-0"
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
				</div>
			</div>
			<div
				id='dropdown'
				//@ts-ignore
				use:clickOutside={() => {
					setIsOpen(false);
				}}
			>
				<svg
					id='dropdown-icon'
					onClick={() => {
						setIsOpen(!isOpen());
					}}
					class='cursor-pointer h-8 w-8 p-1 rounded-md hover:bg-input-gray'
					fill='white'
					stroke-width='0'
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 1024 1024'
					style='overflow: visible; color: white;'
				>
					<path d='M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0 624H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0-312H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z'></path>
				</svg>
				<div
					id='dropdown-items'
					class='absolute left-0 top-10 w-full p-2'
				>
					<div
						class={`bg-black flex flex-col mt-2 gap-2 rounded-md min-w-max w-full overflow-hidden ${
							isOpen() ? "border border-border-gray max-h-96 p-2" : "max-h-0 p-0"
						}`}
					>
						<For each={props.items}>
							{(item) => (
								<Show when={item.group == "dropdown"}>
									<div class='text-sm flex items-center gap-3 hover:bg-input-gray p-2 rounded-md transition-all'>
										<img src={item.icon} />
										<a href={item.path}>{item.label}</a>
									</div>
								</Show>
							)}
						</For>
					</div>
				</div>
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
		<nav>
			<div class='border-b border-border-gray bg-black fixed md:hidden flex w-full items-center justify-between px-4 py-2'>
				<NavbarMobile items={props.items} />
			</div>
		</nav>
	);
};

export default Navbar;