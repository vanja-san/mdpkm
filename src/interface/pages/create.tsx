import { styled } from '@stitches/react';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';

import ImageWrapper from '../components/ImageWrapper';
import { Link, Grid, Button, Typography } from '../../../voxeliface/src';

import { getImage } from '../../util';
import { useAppDispatch } from '../../store/hooks';
import { INSTANCE_CREATORS } from '../../mdpkm';
import { setPage, setCurrentInstance } from '../../store/slices/interface';
export default function Create() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [selected, setSelected] = useState<string | null>(null);
    const changePage = (page: string) => dispatch(setPage(page));
    return <Grid width="100%" height="inherit" padding=".75rem 1rem" vertical>
        <Typography size={20}>
            Create Instance
        </Typography>
        <Link size={12} onClick={() => changePage('instances')}>
            <IconBiArrowLeft/>
            {t('interface:common.action.return_to_instances')}
        </Link>
        <AnimateSharedLayout>
            <Grid height="100%" margin="16px 0 0" vertical spacing={8} css={{ position: 'relative' }}>
                {INSTANCE_CREATORS.map((component, key) =>
                    <Component id={component.id} key={key} selected={selected === component.id} setSelected={setSelected}/>
                )}
            </Grid>
        </AnimateSharedLayout>
    </Grid>;
};

export type ComponentProps = {
    id: string,
    selected: boolean,
    setSelected: (value: string | null) => void
};
function Component({ id, selected, setSelected }: ComponentProps) {
    const { t } = useTranslation();
    return <>
        <ComponentContainer layoutId={`component-${id}`}>
            <Grid height="fit-content" padding={8} spacing={12}>
                <ImageWrapper src={getImage(`component.${id}`)} size={40} shadow canPreview layoutId={`component-img-${id}`} background="$secondaryBackground" borderRadius={8}/>
                <Grid spacing={4} vertical justifyContent="center">
                    <Typography layoutId={`component-title-${id}`} horizontal lineheight={1}>
                        {t(`voxura:component.${id}`)}
                    </Typography>
                </Grid>
            </Grid>
            <Grid height="100%" layoutId={`component-link-${id}`} css={{
                right: 0,
                position: 'absolute'
            }}>
                <Link size={12} padding="0 16px" onClick={() => setSelected(id)}>
                    {t('app.mdpkm.common:actions.continue')}
                    <IconBiArrowRight/>
                </Link>
            </Grid>
        </ComponentContainer>
        <AnimatePresence>
            {selected && <Setup id={id} cancel={() => setSelected(null)}/>}
        </AnimatePresence>
    </>;
};

export type SetupProps = {
    id: string,
    cancel: () => void
};
function Setup({ id, cancel }: SetupProps) {
    const { t } = useTranslation();
    const creator = INSTANCE_CREATORS.find(c => c.id === id);
    const dispatch = useAppDispatch();
    const [data, setData] = useState<any[]>([]);
    const [creating, setCreating] = useState(false);
    const [satisfied, setSatisfied] = useState(false);
    const createInstance = async() => {
        setCreating(true);
        const instance = await creator!.create(data);

        cancel();
        dispatch(setPage('instances'));
        dispatch(setCurrentInstance(instance.id));
    };
    if (!creator)
        throw new Error();

    return <ComponentContainer selected layoutId={`component-${id}`}>
        <Grid width="100%" height="fit-content" css={{
            position: 'relative',
            borderBottom: '1px solid $secondaryBorder2'
        }}>
            <Grid padding={8} spacing={12}>
                <ImageWrapper src={getImage(`component.${id}`)} size={40} shadow canPreview layoutId={`component-img-${id}`} background="$secondaryBackground" borderRadius={8}/>
                <Grid spacing={4} vertical justifyContent="center">
                    <Typography layoutId={`component-title-${id}`} horizontal lineheight={1}>
                        {t(`voxura:component.${id}`)}
                    </Typography>
                </Grid>
            </Grid>
            <Grid height="100%" layoutId={`component-link-${id}`} css={{
                right: 0,
                position: 'absolute'
            }}>
                <Link size={12} padding="0 16px" onClick={cancel} disabled={creating}>
                    <IconBiArrowLeft/>
                    {t('app.mdpkm.common:actions.back')}
                </Link>
            </Grid>
        </Grid>
        <Grid height="100%" animate padding={16} css={{
            overflow: 'hidden',
            position: 'relative'
        }}>
            {creator.render(setData, setSatisfied)}
            <Grid css={{
                bottom: 16,
                position: 'absolute'
            }}>
                <Button theme="accent" onClick={createInstance} disabled={!satisfied || creating}>
                    <IconBiPlusLg/>
                    {t('interface:common.action.create_instance')}
                </Button>
            </Grid>
        </Grid>
    </ComponentContainer>;
};

const ComponentContainer = styled(motion.div, {
    border: 'transparent solid 1px',
    display: 'flex',
    position: 'relative',
    background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box',
    borderRadius: 16,
    flexDirection: 'column',

    variants: {
        selected: {
            true: {
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 2,
                height: '100%',
                position: 'absolute'
            }
        }
    }
});