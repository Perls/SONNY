
import React from 'react';
import ResidentialInterior from './ResidentialInterior';
import CommercialInterior from './CommercialInterior';
import IndustrialInterior from './IndustrialInterior';
import OfficeInterior from './OfficeInterior';
import CornerInterior from './CornerInterior';
import TowerInterior from './TowerInterior';
import ElectronicsStore from './ElectronicsStore';
import MedicalInterior from './MedicalInterior';
import TenementInterior from './TenementInterior';
import RailInterior from './RailInterior';
import ParkInterior from './ParkInterior';
import DockInterior from './DockInterior';
import PawnShop from './PawnShop';
import { InventoryItem } from '../../types';

interface BuildingInteriorProps {
    building: any;
    isOwned: boolean;
    isActiveSafehouse?: boolean; // New prop
    onClose: () => void;
    onRob: () => void;
    onRest: () => void;
    onShop: (item: any) => void;
    onCollect: () => void;
    onStartJob: () => void;
    onSetSafehouse?: (building: any) => void; // New prop
    onTravel?: (x: number, y: number) => void; // Passed down for subway
    onReduceStress?: (amount: number) => void; // New prop for parks/medical
    
    // Pawn Shop Props
    playerInventory?: InventoryItem[];
    playerMoney?: number;
    onSellItem?: (item: InventoryItem, value: number) => void;
}

const BuildingInterior: React.FC<BuildingInteriorProps> = (props) => {
    const { building } = props;

    // Pawn Shop Check (Block 6-0)
    if (building.name === 'Pawn Shop') {
        return (
            <PawnShop 
                inventory={props.playerInventory || []}
                money={props.playerMoney || 0}
                onClose={props.onClose}
                onSell={props.onSellItem || (() => {})}
            />
        );
    }

    // Park Check
    if (building.landmarkId === 'central_park' || building.landmarkId === 'highland_park') {
        return (
            <ParkInterior 
                onClose={props.onClose} 
                onRest={props.onRest} 
                onShop={props.onShop}
                onReduceStress={props.onReduceStress}
                name={building.name} // Pass dynamic name
            />
        );
    }

    // Megablock Tower Check
    if (building.landmarkId === 'megablock_tower') {
        return <TowerInterior onClose={props.onClose} />;
    }

    // KB Electronics Check
    if (building.landmarkId === 'kb_electronics') {
        return <ElectronicsStore onClose={props.onClose} />;
    }

    // Rail Landmarks
    if (building.landmarkId === 'subway_station') {
        return <RailInterior type="subway" onClose={props.onClose} onTravel={props.onTravel || (() => {})} />;
    }
    if (building.landmarkId === 'train_depot') {
        return <RailInterior type="depot" onClose={props.onClose} onTravel={props.onTravel || (() => {})} />;
    }
    
    // Docks Check
    if (building.landmarkId === 'dock_bk' || building.landmarkId === 'dock_qn' || building.landmarkId === 'dock_bx') {
        return <DockInterior building={building} onClose={props.onClose} onShop={props.onShop} />;
    }

    if (building.type === 'medical') {
        return (
            <MedicalInterior 
                building={building}
                onClose={props.onClose}
                onHeal={(cost) => { /* Logic passed via props or context in parent */ }}
                onShop={props.onShop}
                onReduceStress={props.onReduceStress}
            />
        );
    }

    if (building.type === 'residential') {
        // Route to Tenement Interior if name matches
        if (building.name.includes("Tenement")) {
            return <TenementInterior building={building} onClose={props.onClose} />;
        }

        return (
            <ResidentialInterior 
                {...props} 
                isActiveSafehouse={props.isActiveSafehouse || false}
                onSetSafehouse={props.onSetSafehouse || (() => {})}
            />
        );
    }

    if (building.type === 'industrial') {
        return <IndustrialInterior {...props} />;
    }

    if (building.type === 'office') {
        return <OfficeInterior {...props} />;
    }

    if (building.type === 'corner') {
        return <CornerInterior {...props} />;
    }

    // Default to commercial for 'commercial' type or others if extended later
    return <CommercialInterior {...props} />;
};

export default BuildingInterior;
